import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { status } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const ok = status === "ok" || order.status === "PAID";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center space-y-4">
        {ok ? (
          <CheckCircle size={56} className="mx-auto text-green-500" />
        ) : (
          <XCircle size={56} className="mx-auto text-red-400" />
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          {ok ? "Takk for kjøpet!" : "Betaling ikke bekreftet"}
        </h1>
        <p className="text-gray-500 text-sm">
          {ok
            ? "Ordren er registrert. Ta varene dine!"
            : "Vipps-betalingen ble ikke fullført. Prøv igjen."}
        </p>

        {ok && (
          <div className="text-left border-t border-gray-100 pt-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-700">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{item.priceAtTime * item.quantity} kr</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
              <span>Totalt</span>
              <span>{order.total} kr</span>
            </div>
          </div>
        )}

        <Link
          href="/"
          className="block bg-red-500 text-white font-semibold py-3 rounded-xl mt-4 hover:bg-red-600 transition-colors"
        >
          Tilbake til kiosken
        </Link>
      </div>
    </div>
  );
}
