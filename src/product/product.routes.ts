import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { CreateProductSchema, UpdateProductSchema, ProductQuerySchema } from "./product.schemas";
import * as productController from "./product.controller";

const router = Router();

router.get("/", validate(ProductQuerySchema, "query"), productController.getAll);
router.get("/:id", productController.getById);
router.post("/", authenticate, requireAdmin, validate(CreateProductSchema), productController.create);
router.put("/:id", authenticate, requireAdmin, validate(UpdateProductSchema), productController.update);
router.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export default router;
