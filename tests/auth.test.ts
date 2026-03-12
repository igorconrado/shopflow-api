import request from "supertest";
import express from "express";
import authRoutes from "../src/auth/auth.routes";
import { errorHandler } from "../src/middleware/error.middleware";
import prisma from "../src/config/prisma";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

describe("Auth Endpoints", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;

      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: uniqueEmail,
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(uniqueEmail);
      expect(response.body.user.role).toBe("CUSTOMER");

      // Cleanup
      await prisma.user.delete({ where: { email: uniqueEmail } });
    });

    it("should return 400 for duplicate email", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Customer User",
        email: "customer@shopflow.com",
        password: "customer123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "customer@shopflow.com",
        password: "customer123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("customer@shopflow.com");
    });

    it("should return 401 for wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "customer@shopflow.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid credentials");
    });
  });
});
