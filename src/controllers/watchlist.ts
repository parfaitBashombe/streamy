import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const addToWatchlist = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { movieId, status, rating, notes } = req.body;

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error adding a movie to watchlist" });
  }
};

export { addToWatchlist };
