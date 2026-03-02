import jwt from "jsonwebtoken";

import type { Response } from "express";

const generateToken = (userId: string, res: Response): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) {
    throw new Error(
      "JWT_SECRET or EXPIRES_IN environment variable is not defined",
    );
  }

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn: expiresIn as any,
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};

export { generateToken };
