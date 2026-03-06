import type { movie, user, watchlist_item } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: user;
      movie: movie;
      watchlistItem: watchlist_item & { movie: movie };
    }
  }
}

export {};
