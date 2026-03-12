import request from "supertest";
import express from "express";
import productRoutes from "../src/product/product.routes";
import authRoutes from "../src/auth/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";
import prisma from "../src/config/prisma";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use(errorHandler);

describe("Products Endpoints", () => {
  let customerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Get customer token
    const customerResponse = await request(app).post("/api/auth/login").send({
      email: "customer@shopflow.com",
      password: "customer123",
    });
    customerToken = customerResponse.body.token;

    // Get admin token
    const adminResponse = await request(app).post("/api/auth/login").send({
      email: "admin@shopflow.com",
      password: "admin123",
    });
    adminToken = adminResponse.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/products", () => {
    it("should return paginated product list", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("products");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("totalPages");
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it("should filter products by search query", async () => {
      const response = await request(app).get("/api/products?search=iphone");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("products");
      expect(Array.isArray(response.body.products)).toBe(true);

      // Check if results contain search term
      if (response.body.products.length > 0) {
        const hasMatchingName = response.body.products.some((product: any) =>
          product.name.toLowerCase().includes("iphone")
        );
        expect(hasMatchingName).toBe(true);
      }
    });
  });

  describe("POST /api/products", () => {
    it("should create product as ADMIN", async () => {
      // Get a category ID
      const category = await prisma.category.findFirst();

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: `Test Product ${Date.now()}`,
          description: "Test description",
          price: 99.99,
          quantity: 10,
          categoryId: category!.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toContain("Test Product");

      // Cleanup
      await prisma.product.delete({ where: { id: response.body.id } });
    });

    it("should return 403 when CUSTOMER tries to create product", async () => {
      const category = await prisma.category.findFirst();

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "Test Product",
          description: "Test description",
          price: 99.99,
          quantity: 10,
          categoryId: category!.id,
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Admin");
    });
  });
});
