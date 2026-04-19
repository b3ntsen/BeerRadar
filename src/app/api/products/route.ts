import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, price, category, stockQuantity, lowStockThreshold } = body;

  if (!name || !price || !category) {
    return NextResponse.json({ error: "Mangler påkrevde felt" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      price: parseFloat(price),
      category,
      stockQuantity: parseInt(stockQuantity ?? "0"),
      lowStockThreshold: parseInt(lowStockThreshold ?? "5"),
    },
  });

  return NextResponse.json(product, { status: 201 });
}
