import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response } from "express";

const ACCESS_TOKEN_EXPIRES_IN = Number(
  process.env.ACCESS_TOKEN_EXPIRES_IN ?? 900,
);

const REFRESH_TOKEN_EXPIRES_IN = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN ?? 604800,
);

const getEnv = (key: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not set`);
  }

  return value;
};

const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, getEnv("JWT_ACCESS_SECRET"), {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, getEnv("JWT_REFRESH_SECRET"), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getRefreshToken = async (req: Request): Promise<string | undefined> => {
  return req.cookies?.refreshToken as string | undefined;
};

const setRefreshTokenCookie = (res: Response, token: string): void => {
  const refreshCookieDays = Number(process.env.REFRESH_TOKEN_COOKIE_DAYS ?? 7);

  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: refreshCookieDays * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshToken,
};
