import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import {
  addToWatchlistSchema,
  watchlistBodySchema,
  watchlistQuerySchema,
} from "../schemas/watchlist.js";

const addToWatchlist = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const parsed = addToWatchlistSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const { movieId, status, rating, notes } = parsed.data;

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
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
      return res.status(400).json({ error: "Movie already in watchlist" });
    }

    const watchlistItem = await prisma.watchlist_item.create({
      data: {
        user_id: req.user.id,
        movie_id: movieId,
        status: status ?? "PLANNED",
        rating: rating ?? null,
        notes: notes ?? null,
      },
    });

    return res.status(201).json({ status: "Success", data: watchlistItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error adding movie to watchlist" });
  }
};

const removeFromWatchlist = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    await prisma.watchlist_item.delete({
      where: { id: req.watchlistItem.id },
    });

    return res.status(200).json({
      status: "Success",
      message: "Movie removed from watchlist",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error removing movie from watchlist" });
  }
};

const updateWatchlistItem = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const parsed = watchlistBodySchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const { status, rating, notes } = parsed.data;

    const updatedItem = await prisma.watchlist_item.update({
      where: { id: req.watchlistItem.id },
      data: {
        ...(status !== undefined && { status }),
        ...(rating !== undefined && { rating: rating ?? null }),
        ...(notes !== undefined && { notes: notes ?? null }),
      },
    });

    return res.status(200).json({ status: "Success", data: updatedItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating watchlist item" });
  }
};

const getWatchlist = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const parsed = watchlistQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.flatten().fieldErrors });
    }

    const { status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const [watchlist, total] = await prisma.$transaction([
      prisma.watchlist_item.findMany({
        where: {
          user_id: req.user.id,
          ...(status && { status }),
        },
        include: { movie: true },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.watchlist_item.count({
        where: {
          user_id: req.user.id,
          ...(status && { status }),
        },
      }),
    ]);

    return res.status(200).json({
      status: "Success",
      data: watchlist,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching watchlist" });
  }
};

const getWatchlistItem = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    return res.status(200).json({ status: "Success", data: req.watchlistItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching watchlist item" });
  }
};

export {
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
  getWatchlist,
  getWatchlistItem,
};
