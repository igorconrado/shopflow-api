import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { CategorySchema } from "./category.schemas";
import * as categoryController from "./category.controller";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", authenticate, requireAdmin, validate(CategorySchema), categoryController.create);
router.put("/:id", authenticate, requireAdmin, validate(CategorySchema), categoryController.update);
router.delete("/:id", authenticate, requireAdmin, categoryController.deleteCategory);

export default router;
