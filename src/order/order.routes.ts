import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { CreateOrderSchema, UpdateOrderStatusSchema } from "./order.schemas";
import * as orderController from "./order.controller";

const router = Router();

router.post("/", authenticate, validate(CreateOrderSchema), orderController.createOrder);
router.get("/", authenticate, orderController.getOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  validate(UpdateOrderStatusSchema),
  orderController.updateOrderStatus
);
router.post("/:id/cancel", authenticate, orderController.cancelOrder);

export default router;
