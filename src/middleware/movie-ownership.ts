import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

type MovieParams = {
  id: string;
};

const movieOwnershipMiddleware = async (
  req: Request<MovieParams>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      res.status(404).json({ error: "Movie item not found" });
      return;
    }

    if (movie.created_by !== req.user.id) {
      res.status(403).json({ error: "Unauthorized to access this item" });
      return;
    }

    req.movie = movie;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error verifying movie item ownership" });
  }
};

export { movieOwnershipMiddleware };
