import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbUrl = `file:${path.resolve(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash },
  });

  const products = [
    { name: "Coca-Cola", category: "Brus", price: 25, stockQuantity: 24, lowStockThreshold: 6 },
    { name: "Pepsi", category: "Brus", price: 25, stockQuantity: 24, lowStockThreshold: 6 },
    { name: "Farris Naturell", category: "Brus", price: 25, stockQuantity: 12, lowStockThreshold: 4 },
    { name: "Monster Original", category: "Energidrikk", price: 35, stockQuantity: 24, lowStockThreshold: 6 },
    { name: "Monster Ultra", category: "Energidrikk", price: 35, stockQuantity: 12, lowStockThreshold: 6 },
    { name: "Red Bull", category: "Energidrikk", price: 35, stockQuantity: 24, lowStockThreshold: 6 },
    { name: "Kvikk Lunsj", category: "Sjokolade", price: 20, stockQuantity: 20, lowStockThreshold: 5 },
    { name: "Daim", category: "Sjokolade", price: 20, stockQuantity: 20, lowStockThreshold: 5 },
    { name: "Twist pose", category: "Snacks", price: 20, stockQuantity: 15, lowStockThreshold: 5 },
    { name: "Nøtter (saltet)", category: "Snacks", price: 25, stockQuantity: 10, lowStockThreshold: 3 },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  console.log("Seed ferdig. Admin-bruker: admin / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
