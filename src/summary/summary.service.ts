import prisma from "../config/prisma";

export async function getDashboard() {
  // Total orders by status
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  const ordersCount = ordersByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  // Total revenue (DELIVERED orders)
  const deliveredOrders = await prisma.order.aggregate({
    where: { status: "DELIVERED" },
    _sum: {
      total: true,
    },
  });

  const totalRevenue = deliveredOrders._sum.total || 0;

  // Total revenue pending (CONFIRMED + SHIPPED orders)
  const pendingOrders = await prisma.order.aggregate({
    where: {
      status: {
        in: ["CONFIRMED", "SHIPPED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  const totalRevenuePending = pendingOrders._sum.total || 0;

  // Low stock products (quantity < 10), sorted by quantity ASC
  const lowStockProducts = await prisma.product.findMany({
    where: {
      quantity: {
        lt: 10,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      quantity: "asc",
    },
  });

  // Top 5 best selling products (by total quantity in OrderItems)
  const bestSellingProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  // Fetch product details for best sellers
  const topProducts = await Promise.all(
    bestSellingProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });
      return {
        product,
        totalSold: item._sum.quantity || 0,
      };
    })
  );

  return {
    ordersCount,
    totalRevenue,
    totalRevenuePending,
    lowStockProducts,
    topProducts,
  };
}
