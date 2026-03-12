import { Request, Response, NextFunction } from "express";
import * as summaryService from "./summary.service";

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const dashboard = await summaryService.getDashboard();
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
}
