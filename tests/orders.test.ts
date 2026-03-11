import request from "supertest";
import express from "express";
import cartRoutes from "../src/cart/cart.routes";
import orderRoutes from "../src/order/order.routes";
import authRoutes from "../src/auth/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";
import prisma from "../src/config/prisma";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use(errorHandler);

describe("Orders Endpoints", () => {
  let customerToken: string;
  let productId: string;
  let initialStock: number;

  beforeAll(async () => {
    // Get customer token
    const customerResponse = await request(app).post("/api/auth/login").send({
      email: "customer@shopflow.com",
      password: "customer123",
    });
    customerToken = customerResponse.body.token;

    // Get a product for testing
    const product = await prisma.product.findFirst();
    productId = product!.id;
    initialStock = product!.quantity;
  });

  beforeEach(async () => {
    // Clear cart before each test
    const customer = await prisma.user.findUnique({
      where: { email: "customer@shopflow.com" },
    });

    if (customer) {
      const cart = await prisma.cart.findUnique({
        where: { userId: customer.id },
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/orders", () => {
    it("should create order from cart, clear cart, and decrease stock", async () => {
      // Add item to cart
      await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          productId,
          quantity: 2,
        });

      // Get product stock before order
      const productBefore = await prisma.product.findUnique({
        where: { id: productId },
      });

      // Create order
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.status).toBe("PENDING");
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(2);

      // Verify cart is empty
      const cartResponse = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(cartResponse.body.items).toHaveLength(0);
      expect(cartResponse.body.total).toBe(0);

      // Verify stock decreased
      const productAfter = await prisma.product.findUnique({
        where: { id: productId },
      });

      expect(productAfter!.quantity).toBe(productBefore!.quantity - 2);
    });

    it("should return 400 when cart is empty", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("empty");
    });
  });

  describe("POST /api/orders/:id/cancel", () => {
    it("should cancel pending order and restore stock", async () => {
      // Add item to cart
      await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          productId,
          quantity: 1,
        });

      // Create order
      const orderResponse = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      const orderId = orderResponse.body.id;

      // Get product stock before cancellation
      const productBefore = await prisma.product.findUnique({
        where: { id: productId },
      });

      // Cancel order
      const cancelResponse = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.status).toBe("CANCELLED");

      // Verify stock restored
      const productAfter = await prisma.product.findUnique({
        where: { id: productId },
      });

      expect(productAfter!.quantity).toBe(productBefore!.quantity + 1);
    });
  });
});
