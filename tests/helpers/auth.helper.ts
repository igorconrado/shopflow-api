import request from "supertest";
import express from "express";
import authRoutes from "../../src/auth/auth.routes";
import { errorHandler } from "../../src/middleware/error.middleware";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export async function loginAsCustomer(): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "customer@shopflow.com",
      password: "customer123",
    });

  return response.body.token;
}

export async function loginAsAdmin(): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@shopflow.com",
      password: "admin123",
    });

  return response.body.token;
}

export { app };
