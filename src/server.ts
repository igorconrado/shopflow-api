import "dotenv/config";
import express from "express";
import authRoutes from "./auth/auth.routes";
import categoryRoutes from "./category/category.routes";
import productRoutes from "./product/product.routes";
import cartRoutes from "./cart/cart.routes";
import orderRoutes from "./order/order.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
