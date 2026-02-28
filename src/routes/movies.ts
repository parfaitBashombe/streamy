import express, { Router } from "express";

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.json({ movies: "movies are here" });
});

export default router;
