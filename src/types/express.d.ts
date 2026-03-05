import type { watchlist_item, movie, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: User;
      watchlistItem: watchlist_item & { movie: movie };
    }
  }
}
