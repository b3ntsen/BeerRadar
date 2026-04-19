import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: parseFloat(body.price) }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.stockQuantity !== undefined && { stockQuantity: parseInt(body.stockQuantity) }),
      ...(body.lowStockThreshold !== undefined && { lowStockThreshold: parseInt(body.lowStockThreshold) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.product.update({
    where: { id: parseInt(id) },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
