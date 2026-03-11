import prisma from "../config/prisma";
import { NotFoundError, BadRequestError } from "../config/errors";
import { CreateProductInput, UpdateProductInput, ProductQuery } from "./product.schemas";

export async function getAll(query: ProductQuery) {
  const { category, minPrice, maxPrice, search, page, limit } = query;

  const where: any = {};

  if (category) {
    where.categoryId = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    products,
    total,
    page,
    totalPages,
  };
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

export async function create(data: CreateProductInput) {
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new BadRequestError("Category not found");
  }

  return await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      imageUrl: data.imageUrl,
      categoryId: data.categoryId,
    },
    include: { category: true },
  });
}

export async function update(id: string, data: UpdateProductInput) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new BadRequestError("Category not found");
    }
  }

  return await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  await prisma.product.delete({
    where: { id },
  });
}

export async function decreaseStock(id: string, quantity: number, tx?: any) {
  const client = tx || prisma;

  const product = await client.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.quantity < quantity) {
    throw new BadRequestError(`Insufficient stock. Available: ${product.quantity}, requested: ${quantity}`);
  }

  return await client.product.update({
    where: { id },
    data: {
      quantity: {
        decrement: quantity,
      },
    },
  });
}

export async function restoreStock(id: string, quantity: number, tx?: any) {
  const client = tx || prisma;

  return await client.product.update({
    where: { id },
    data: {
      quantity: {
        increment: quantity,
      },
    },
  });
}
