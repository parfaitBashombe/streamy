import express, { Router } from "express";
import {
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistItem,
  getWatchlist,
  getWatchlistItem,
} from "../controllers/watchlist.js";
import { authMiddleware } from "../middleware/auth.js";
import { watchlistOwnershipMiddleware } from "../middleware/watchlist-ownership.js";
import { validate } from "../middleware/validate-request.js";
import {
  addToWatchlistSchema,
  watchlistBodySchema,
  watchlistQuerySchema,
} from "../schemas/watchlist.js";

const router: Router = express.Router();

router.use(authMiddleware);

router.get("/", validate(watchlistQuerySchema, "query"), getWatchlist);
router.post("/", validate(addToWatchlistSchema), addToWatchlist);

router.get("/:id", watchlistOwnershipMiddleware, getWatchlistItem);
router.patch(
  "/:id",
  watchlistOwnershipMiddleware,
  validate(watchlistBodySchema),
  updateWatchlistItem,
);
router.delete("/:id", watchlistOwnershipMiddleware, removeFromWatchlist);

export default router;
