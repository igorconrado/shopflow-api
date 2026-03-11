import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = target === "body" ? req.body : target === "query" ? req.query : req.params;
    const result = schema.safeParse(data);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    // Assign validated data - query goes to a custom property since it's readonly
    if (target === "body") {
      req.body = result.data;
    } else if (target === "query") {
      (req as any).validatedQuery = result.data;
    }

    next();
  };
}
