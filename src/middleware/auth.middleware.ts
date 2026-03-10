import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token not provided" });
    return;
  }

  const token = header.split(" ")[1];
  const decoded = verifyToken(token);
  req.user = decoded;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}
