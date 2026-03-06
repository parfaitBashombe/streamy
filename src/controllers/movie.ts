import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type {
  CreateMovieBody,
  UpdateMovieBody,
  MovieQuery,
} from "../schemas/movie.js";

type MovieParams = {
  id: string;
};

const createMovie = async (
  req: Request<{}, {}, CreateMovieBody>,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { title, overview, release_year, genres, runtime, poster_url } =
      req.body;

    const movie = await prisma.movie.create({
      data: {
        title,
        overview: overview ?? null,
        release_year,
        genres: genres ?? [],
        runtime: runtime ?? null,
        poster_url: poster_url ?? null,
        created_by: req.user.id,
      },
    });

    return res.status(201).json({ status: "Success", data: movie });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating movie" });
  }
};

const getMovies = async (
  req: Request,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { title, genre, release_year, page, limit } = res.locals
      .query as MovieQuery;

    const skip = (page - 1) * limit;

    const where = {
      ...(title && {
        title: {
          contains: title,
          mode: "insensitive" as const,
        },
      }),
      ...(genre && {
        genres: {
          has: genre,
        },
      }),
      ...(release_year !== undefined && { release_year }),
    };

    const [movies, total] = await prisma.$transaction([
      prisma.movie.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.movie.count({ where }),
    ]);

    return res.status(200).json({
      status: "Success",
      data: movies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching movies" });
  }
};

const getMovie = async (
  req: Request<MovieParams>,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    return res.status(200).json({ status: "Success", data: movie });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error fetching movie" });
  }
};

const updateMovie = async (
  req: Request<MovieParams, {}, UpdateMovieBody>,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { id } = req.params;
    const { title, overview, release_year, genres, runtime, poster_url } =
      req.body;

    const existingMovie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    if (existingMovie.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to update this movie" });
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(overview !== undefined && { overview: overview ?? null }),
        ...(release_year !== undefined && { release_year }),
        ...(genres !== undefined && { genres }),
        ...(runtime !== undefined && { runtime: runtime ?? null }),
        ...(poster_url !== undefined && { poster_url: poster_url ?? null }),
      },
    });

    return res.status(200).json({ status: "Success", data: updatedMovie });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error updating movie" });
  }
};

const deleteMovie = async (
  req: Request<MovieParams>,
  res: Response,
): Promise<Response | undefined> => {
  try {
    const { id } = req.params;

    const existingMovie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    if (existingMovie.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this movie" });
    }

    await prisma.movie.delete({
      where: { id },
    });

    return res.status(200).json({
      status: "Success",
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error deleting movie" });
  }
};

export { createMovie, getMovies, getMovie, updateMovie, deleteMovie };
