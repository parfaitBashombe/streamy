import { z } from "zod";

export const watchlistStatusSchema = z.enum([
  "PLANNED",
  "WATCHED",
  "COMPLETED",
  "DROPPED",
]);

export const watchlistBodySchema = z.object({
  status: watchlistStatusSchema.optional(),
  rating: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const addToWatchlistSchema = watchlistBodySchema.extend({
  movieId: z.string().uuid(),
});

export const watchlistQuerySchema = z.object({
  status: watchlistStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type WatchlistStatus = z.infer<typeof watchlistStatusSchema>;
export type WatchlistBody = z.infer<typeof watchlistBodySchema>;
export type AddToWatchlistBody = z.infer<typeof addToWatchlistSchema>;
export type WatchlistQuery = z.infer<typeof watchlistQuerySchema>;
