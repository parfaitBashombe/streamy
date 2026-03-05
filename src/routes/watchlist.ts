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

const router: Router = express.Router();

router.use(authMiddleware);

router.get("/", getWatchlist);
router.post("/", addToWatchlist);

router.get("/:id", watchlistOwnershipMiddleware, getWatchlistItem);
router.patch("/:id", watchlistOwnershipMiddleware, updateWatchlistItem);
router.delete("/:id", watchlistOwnershipMiddleware, removeFromWatchlist);

export default router;
