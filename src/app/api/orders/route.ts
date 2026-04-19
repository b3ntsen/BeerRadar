import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initiateVippsPayment } from "@/lib/vipps";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as {
      items: { id: number; quantity: number; price: number; name: string }[];
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Tom handlekurv" }, { status: 400 });
    }

    const productIds = items.map((i) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Vare "${item.name}" finnes ikke` },
          { status: 400 }
        );
      }
      if (dbProduct.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Ikke nok på lager: ${dbProduct.name}` },
          { status: 400 }
        );
      }
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        total,
        status: "PENDING",
        items: {
          create: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
            priceAtTime: i.price,
          })),
        },
      },
    });

    const host = req.headers.get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const vippsResult = await initiateVippsPayment({
      orderId: order.id,
      amount: Math.round(total * 100),
      returnUrl: `${baseUrl}/order/${order.id}`,
      callbackUrl: `${baseUrl}/api/vipps/callback`,
    });

    if (vippsResult.url) {
      await prisma.order.update({
        where: { id: order.id },
        data: { vippsOrderId: vippsResult.reference },
      });
      return NextResponse.json({ orderId: order.id, vippsUrl: vippsResult.url });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Intern feil" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("x-admin-token");
  if (authHeader !== process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  return NextResponse.json(orders);
}
