import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import * as summaryController from "./summary.controller";

const router = Router();

router.get("/", authenticate, requireAdmin, summaryController.getDashboard);

export default router;
