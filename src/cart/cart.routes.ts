import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { AddItemSchema, UpdateItemSchema } from "./cart.schemas";
import * as cartController from "./cart.controller";

const router = Router();

router.get("/", authenticate, cartController.getCart);
router.post("/items", authenticate, validate(AddItemSchema), cartController.addItem);
router.put("/items/:itemId", authenticate, validate(UpdateItemSchema), cartController.updateItem);
router.delete("/items/:itemId", authenticate, cartController.removeItem);
router.delete("/", authenticate, cartController.clearCart);

export default router;
