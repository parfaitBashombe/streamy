import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ movies: "movies are here" });
});

export default router;
