import express, { Router } from "express";
import { addToWatchlist } from "../controllers/watchlist.js";

const router: Router = express.Router();

router.post("/", addToWatchlist);

export default router;
