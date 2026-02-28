import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import type { Request, Response } from "express";

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

    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name,
          email,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export { register };
