import express, { Router } from "express";
import { addToWatchlist } from "../controllers/watchlist.js";
import { authMiddleware } from "../middleware/auth.js";

const router: Router = express.Router();
router.use(authMiddleware);

router.post("/", addToWatchlist);

export default router;
