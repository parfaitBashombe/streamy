import jwt from "jsonwebtoken";

import type { Response } from "express";

const generateToken = (userId: string, res: Response): string => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.EXPIRES_IN ?? "7d") as any,
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
