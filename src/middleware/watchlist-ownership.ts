import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";

const watchlistOwnershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const itemId = req.params.id as string;

    const watchlistItem = await prisma.watchlist_item.findUnique({
      where: { id: itemId },
      include: { movie: true },
    });

    if (!watchlistItem) {
      res.status(404).json({ error: "Watchlist item not found" });
      return;
    }

    if (watchlistItem.user_id !== req.user.id) {
      res.status(403).json({ error: "Unauthorized to access this item" });
      return;
    }

    req.watchlistItem = watchlistItem;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error verifying watchlist item ownership" });
  }
};

export { watchlistOwnershipMiddleware };
