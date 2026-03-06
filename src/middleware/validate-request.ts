import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type RequestField = "body" | "query" | "params";

const validate =
  (schema: ZodSchema, field: RequestField = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[field]);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    (req as Record<RequestField, unknown>)[field] = parsed.data;
    next();
  };

export { validate };
