import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, name: eventName } = body;

    if (!reference) {
      return NextResponse.json({ error: "Mangler reference" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { vippsOrderId: reference },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Ordre ikke funnet" }, { status: 404 });
    }

    if (eventName === "epayments.payment.authorized.v1") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }
      });
    } else if (eventName === "epayments.payment.aborted.v1") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Vipps callback-feil:", err);
    return NextResponse.json({ error: "Intern feil" }, { status: 500 });
  }
}
