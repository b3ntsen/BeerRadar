import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Period = "today" | "week" | "month" | "all";

function getPeriodStart(period: Period): Date | undefined {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "month") {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return undefined;
}

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams;
  const period: Period = (rawPeriod as Period) ?? "month";
  const since = getPeriodStart(period);

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { select: { name: true, category: true } } } },
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  const byCategoryMap = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const cat = item.product.category;
      byCategoryMap.set(cat, (byCategoryMap.get(cat) ?? 0) + item.priceAtTime * item.quantity);
    }
  }
  const byCategory = [...byCategoryMap.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ordrer & regnskap</h1>

      {/* Period filter */}
      <div className="flex gap-2">
        {(["today", "week", "month", "all"] as Period[]).map((p) => (
          <a
            key={p}
            href={`/admin/orders?period=${p}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === p
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p === "today" ? "I dag" : p === "week" ? "7 dager" : p === "month" ? "Denne mnd" : "Alt"}
          </a>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total omsetning</p>
          <p className="text-2xl font-bold text-gray-900">{totalRevenue} kr</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Antall ordrer</p>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          {totalOrders > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              Snitt: {Math.round(totalRevenue / totalOrders)} kr/ordre
            </p>
          )}
        </div>
      </div>

      {/* By category */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Per kategori</h2>
          <div className="space-y-2">
            {byCategory.map(([cat, amount]) => (
              <div key={cat} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{cat}</span>
                <span className="font-semibold text-gray-900">{amount} kr</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="px-4 py-3 font-semibold text-gray-900 text-sm">
          Ordrehistorikk ({orders.length})
        </div>
        {orders.length === 0 && (
          <p className="px-4 py-6 text-gray-400 text-sm text-center">Ingen betalte ordrer i perioden</p>
        )}
        {orders.map((order) => (
          <div key={order.id} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">Ordre #{order.id}</span>
              <span className="font-bold text-gray-900">{order.total} kr</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(", ")}
              </p>
              <p className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {new Date(order.createdAt).toLocaleDateString("nb-NO", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
