import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import type { Request, Response } from "express";
import { generateToken } from "../utils/generate-token.js";

const register = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).json({ error: "Email already used" });
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

    // Generate JWT token
    const token = generateToken(user.id, res);

    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name,
          email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error registering a user" });
  }
};

const login = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user.id, res);

    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          email,
        },
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error signing a user" });
  }
};

const logout = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error signing out a user" });
  }
};

export { register, login, logout };
