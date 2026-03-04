import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import type { NextFunction, Request, Response } from "express";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({ error: "Not authorized, no token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ error: "User no longer exists" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: "Not authorized, invalid token" });
    return;
  }
};

export { authMiddleware };
