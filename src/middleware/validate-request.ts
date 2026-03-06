import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type RequestField = "body" | "query" | "params";

const validate =
  <T>(schema: ZodSchema<T>, field: RequestField = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req[field]);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten().fieldErrors });
      return;
    }

    if (field === "query") {
      res.locals.query = parsed.data;
    } else if (field === "body") {
      req.body = parsed.data;
    } else {
      req.params = parsed.data as Request["params"];
    }

    next();
  };

export { validate };
