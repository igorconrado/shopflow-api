import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { generateToken } from "../config/jwt";
import { RegisterInput, LoginInput } from "./auth.schemas";
import { BadRequestError, UnauthorizedError } from "../config/errors";

export async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    throw new BadRequestError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const valid = await bcrypt.compare(data.password, user.password);

  if (!valid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = generateToken(user.id, user.role);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}
