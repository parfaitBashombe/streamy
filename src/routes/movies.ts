import express, { Router } from "express";
import {
  createMovie,
  getMovies,
  getMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.js";
import { authMiddleware } from "../middleware/auth.js";
import { movieOwnershipMiddleware } from "../middleware/movie-ownership.js";
import { validate } from "../middleware/validate-request.js";
import {
  createMovieSchema,
  updateMovieSchema,
  movieQuerySchema,
} from "../schemas/movie.js";

const router: Router = express.Router();

// router.use(authMiddleware);

router.get("/", validate(movieQuerySchema, "query"), getMovies);
router.post("/", authMiddleware, validate(createMovieSchema), createMovie);

router.get("/:id", getMovie);
router.patch(
  "/:id",
  authMiddleware,
  movieOwnershipMiddleware,
  validate(updateMovieSchema),
  updateMovie,
);
router.delete("/:id", authMiddleware, movieOwnershipMiddleware, deleteMovie);

export default router;
