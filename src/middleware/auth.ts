import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import type { NextFunction, Request, Response } from "express";

type AccessTokenPayload = {
  id: string;
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Not authorized, no token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Not authorized, no token provided" });
      return;
    }

    let decoded: AccessTokenPayload;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!,
      ) as AccessTokenPayload;
    } catch {
      res
        .status(401)
        .json({ error: "Not authorized, invalid or expired token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { refresh_token: true },
    });

    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }

    const session = user.refresh_token;

    if (
      !session ||
      session.revoked_at !== null ||
      session.expires_at < new Date()
    ) {
      res
        .status(401)
        .json({ error: "Session expired or logged out, please log in again" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Not authorized, invalid token" });
  }
};
