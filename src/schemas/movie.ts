import { z } from "zod";

export const movieBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  overview: z.string().nullable().optional(),
  release_year: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 5),
  genres: z.array(z.string().min(1)).default([]),
  runtime: z.number().int().positive().nullable().optional(),
  poster_url: z.string().url().nullable().optional(),
});

export const createMovieSchema = movieBodySchema;

export const updateMovieSchema = movieBodySchema.partial();

export const movieQuerySchema = z.object({
  title: z.string().optional(),
  genre: z.string().optional(),
  release_year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type MovieBody = z.infer<typeof movieBodySchema>;
export type CreateMovieBody = z.infer<typeof createMovieSchema>;
export type UpdateMovieBody = z.infer<typeof updateMovieSchema>;
export type MovieQuery = z.infer<typeof movieQuerySchema>;
