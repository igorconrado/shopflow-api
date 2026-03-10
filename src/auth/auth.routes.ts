import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { RegisterSchema, LoginSchema } from "./auth.schemas";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", validate(RegisterSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);

export default router;
