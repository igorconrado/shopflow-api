import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";
import { NotFoundError } from "../config/errors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
