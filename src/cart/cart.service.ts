import prisma from "../config/prisma";
import { NotFoundError, BadRequestError } from "../config/errors";
import { AddItemInput, UpdateItemInput } from "./cart.schemas";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
}

export async function getCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  const cartWithItems = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const total = cartWithItems!.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = cartWithItems!.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return {
    ...cartWithItems,
    total,
    itemCount,
  };
}

export async function addItem(userId: string, data: AddItemInput) {
  const cart = await getOrCreateCart(userId);

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  if (product.quantity < data.quantity) {
    throw new BadRequestError(
      `Insufficient stock. Available: ${product.quantity}, requested: ${data.quantity}`
    );
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: data.productId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + data.quantity;

    if (product.quantity < newQuantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${product.quantity}, total requested: ${newQuantity}`
      );
    }

    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: { product: true },
    });
  }

  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: data.productId,
      quantity: data.quantity,
    },
    include: { product: true },
  });
}

export async function updateItem(
  userId: string,
  cartItemId: string,
  data: UpdateItemInput
) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!cartItem) {
    throw new NotFoundError("Cart item not found");
  }

  if (cartItem.cart.userId !== userId) {
    throw new BadRequestError("Unauthorized to update this cart item");
  }

  if (cartItem.product.quantity < data.quantity) {
    throw new BadRequestError(
      `Insufficient stock. Available: ${cartItem.product.quantity}, requested: ${data.quantity}`
    );
  }

  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: data.quantity },
    include: { product: true },
  });
}

export async function removeItem(userId: string, cartItemId: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    throw new NotFoundError("Cart item not found");
  }

  if (cartItem.cart.userId !== userId) {
    throw new BadRequestError("Unauthorized to remove this cart item");
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}
