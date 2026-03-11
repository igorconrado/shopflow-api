import prisma from "../config/prisma";
import { NotFoundError, BadRequestError } from "../config/errors";
import { UpdateOrderStatusInput } from "./order.schemas";

export async function createOrder(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  // Validate stock availability for all products
  for (const item of cart.items) {
    if (item.product.quantity < item.quantity) {
      throw new BadRequestError(
        `Insufficient stock for ${item.product.name}. Available: ${item.product.quantity}, requested: ${item.quantity}`
      );
    }
  }

  // Calculate total
  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Use transaction to ensure atomicity
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
      },
    });

    // Create order items with price snapshot
    for (const item of cart.items) {
      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        },
      });

      // Decrease stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Return order with items
    return await tx.order.findUnique({
      where: { id: newOrder.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  });

  return order;
}

export async function getOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.userId !== userId) {
    throw new BadRequestError("Unauthorized to view this order");
  }

  return order;
}

export async function updateOrderStatus(orderId: string, data: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // If changing to CANCELLED and not already cancelled, restore stock
  if (data.status === "CANCELLED" && order.status !== "CANCELLED") {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: data.status },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: data.status },
    });
  }

  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (order.userId !== userId) {
    throw new BadRequestError("Unauthorized to cancel this order");
  }

  if (order.status !== "PENDING") {
    throw new BadRequestError("Only pending orders can be cancelled");
  }

  // Restore stock and update status in transaction
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}
