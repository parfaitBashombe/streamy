import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import type { Request, Response } from "express";
import type { RegisterBody, LoginBody } from "../schemas/auth.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshToken,
} from "../utils/generate-token.js";

const getRefreshExpiryDate = (): Date => {
  const days = Number(process.env.REFRESH_TOKEN_COOKIE_DAYS ?? 7);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body as RegisterBody;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = hashToken(refreshToken);

    await prisma.refresh_token.upsert({
      where: { user_id: user.id },
      update: {
        token_hash: refreshTokenHash,
        expires_at: getRefreshExpiryDate(),
        revoked_at: null,
      },
      create: {
        token_hash: refreshTokenHash,
        user_id: user.id,
        expires_at: getRefreshExpiryDate(),
      },
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      status: "Success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registering user" });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const existingToken = await prisma.refresh_token.findUnique({
      where: { user_id: user.id },
    });

    const now = new Date();
    const isExpired = existingToken && existingToken.expires_at < now;
    const isRevoked = existingToken && existingToken.revoked_at !== null;

    if (existingToken && !isExpired && !isRevoked) {
      const accessToken = generateAccessToken(user.id);
      res.status(409).json({
        error: "You are already logged in",
        data: {
          // user: {
          //   id: user.id,
          //   name: user.name,
          //   email: user.email,
          // },
          accessToken,
        },
      });
      return;
    }

    let refreshToken: string;

    if (!existingToken || isExpired) {
      refreshToken = generateRefreshToken(user.id);
      const refreshTokenHash = hashToken(refreshToken);

      if (isExpired) {
        await prisma.refresh_token.delete({
          where: { user_id: user.id },
        });
      }

      await prisma.refresh_token.create({
        data: {
          token_hash: refreshTokenHash,
          user_id: user.id,
          expires_at: getRefreshExpiryDate(),
        },
      });
    } else {
      refreshToken = generateRefreshToken(user.id);
      const refreshTokenHash = hashToken(refreshToken);

      await prisma.refresh_token.update({
        where: { user_id: user.id },
        data: {
          token_hash: refreshTokenHash,
          expires_at: getRefreshExpiryDate(),
          revoked_at: null,
        },
      });
    }

    const accessToken = generateAccessToken(user.id);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      status: "Success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error signing in user" });
  }
};

const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const refreshToken = await getRefreshToken(req);

    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token missing" });
      return;
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as jwt.JwtPayload;
    } catch {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const refreshTokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refresh_token.findUnique({
      where: { token_hash: refreshTokenHash },
    });

    if (
      !storedToken ||
      storedToken.revoked_at ||
      storedToken.expires_at < new Date()
    ) {
      res.status(401).json({ error: "Refresh token is not valid" });
      return;
    }

    const userId = decoded.id as string;

    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);
    const newRefreshTokenHash = hashToken(newRefreshToken);

    await prisma.refresh_token.update({
      where: { id: storedToken.id },
      data: {
        token_hash: newRefreshTokenHash,
        expires_at: getRefreshExpiryDate(),
        revoked_at: null,
      },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      status: "Success",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error refreshing access token" });
  }
};

const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = await getRefreshToken(req);

    if (!refreshToken) {
      res.status(400).json({ error: "No refresh token provided" });
      return;
    }

    const refreshTokenHash = hashToken(refreshToken);

    const existingToken = await prisma.refresh_token.findFirst({
      where: {
        token_hash: refreshTokenHash,
        user_id: req.user.id,
      },
    });

    if (!existingToken) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    if (existingToken.revoked_at !== null) {
      res.status(401).json({ error: "Session already logged out" });
      return;
    }

    await prisma.refresh_token.update({
      where: { id: existingToken.id },
      data: { revoked_at: new Date() },
    });

    clearRefreshTokenCookie(res);

    res.status(200).json({
      status: "Success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error signing out user" });
  }
};
export { register, login, refreshAccessToken, logout };
