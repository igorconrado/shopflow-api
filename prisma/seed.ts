import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);
  const customerHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@shopflow.com" },
    update: {},
    create: {
      email: "admin@shopflow.com",
      password: passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@shopflow.com" },
    update: {},
    create: {
      email: "customer@shopflow.com",
      password: customerHash,
      name: "Customer User",
      role: "CUSTOMER",
    },
  });

  const categories = await Promise.all(
    ["Electronics", "Clothing", "Books", "Food", "Sports"].map((name: string) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const products = [
    { name: "Wireless Headphones", description: "Bluetooth over-ear headphones with noise cancellation", price: 89.99, quantity: 50, categoryIndex: 0 },
    { name: "Smartphone Case", description: "Shockproof silicone case for smartphones", price: 19.99, quantity: 200, categoryIndex: 0 },
    { name: "Cotton T-Shirt", description: "Comfortable 100% cotton crew neck t-shirt", price: 24.99, quantity: 150, categoryIndex: 1 },
    { name: "Running Jacket", description: "Lightweight waterproof running jacket", price: 59.99, quantity: 75, categoryIndex: 1 },
    { name: "JavaScript Guide", description: "Comprehensive guide to modern JavaScript", price: 39.99, quantity: 100, categoryIndex: 2 },
    { name: "Sci-Fi Novel", description: "Bestselling science fiction adventure novel", price: 14.99, quantity: 120, categoryIndex: 2 },
    { name: "Organic Coffee Beans", description: "Premium arabica coffee beans, 1kg bag", price: 29.99, quantity: 80, categoryIndex: 3 },
    { name: "Dark Chocolate Bar", description: "72% cacao artisan dark chocolate, 200g", price: 6.99, quantity: 300, categoryIndex: 3 },
    { name: "Yoga Mat", description: "Non-slip exercise yoga mat, 6mm thick", price: 34.99, quantity: 90, categoryIndex: 4 },
    { name: "Basketball", description: "Official size indoor/outdoor basketball", price: 44.99, quantity: 60, categoryIndex: 4 },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        quantity: product.quantity,
        categoryId: categories[product.categoryIndex].id,
      },
    });
  }

  console.log("Seed completed:");
  console.log(`  Users: ${admin.name}, ${customer.name}`);
  console.log(`  Categories: ${categories.map((c: { name: string }) => c.name).join(", ")}`);
  console.log(`  Products: ${products.length} created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
