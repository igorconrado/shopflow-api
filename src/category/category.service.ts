import prisma from "../config/prisma";
import { NotFoundError, BadRequestError } from "../config/errors";
import { CategoryInput } from "./category.schemas";

export async function getAll() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
}

export async function create(data: CategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    throw new BadRequestError("Category name already exists");
  }

  return await prisma.category.create({
    data: { name: data.name },
  });
}

export async function update(id: string, data: CategoryInput) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const existing = await prisma.category.findFirst({
    where: {
      name: data.name,
      id: { not: id },
    },
  });

  if (existing) {
    throw new BadRequestError("Category name already exists");
  }

  return await prisma.category.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  await prisma.category.delete({
    where: { id },
  });
}
