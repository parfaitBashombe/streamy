import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const addToWatchlist = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { movieId, status, rating, notes } = req.body;

    const movie = await prisma.movie.findUnique({
      where: {
        id: movieId,
      },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    const existingInWatchlist = await prisma.watchlist_item.findUnique({
      where: {
        user_id_movie_id: {
          user_id: req.user.id,
          movie_id: movieId,
        },
      },
    });

    if (existingInWatchlist) {
      return res.status(400).json({ error: "Movie already in Watchlist" });
    }

    const watchlistItem = await prisma.watchlist_item.create({
      data: {
        user_id: req.user.id,
        movie_id: movieId,
        status: status || "PLANNED",
        rating,
        notes,
      },
    });

    return res.status(201).json({
      status: "Success",
      data: watchlistItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error adding a movie to watchlist" });
  }
};

export { addToWatchlist };
