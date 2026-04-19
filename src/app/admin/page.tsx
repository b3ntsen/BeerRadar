import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Package, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, products, lowStock] = await Promise.all([
    prisma.order.findMany({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({ where: { isActive: true } }).then((all) =>
      all.filter((p) => p.stockQuantity <= p.lowStockThreshold)
    ),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySales = await prisma.order.aggregate({
    where: { status: "PAID", createdAt: { gte: todayStart } },
    _sum: { total: true },
    _count: true,
  });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthSales = await prisma.order.aggregate({
    where: { status: "PAID", createdAt: { gte: monthStart } },
    _sum: { total: true },
    _count: true,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Salg i dag"
          value={`${todaySales._sum.total ?? 0} kr`}
          sub={`${todaySales._count} ordre`}
          icon={<TrendingUp size={18} className="text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          label="Salg denne mnd"
          value={`${monthSales._sum.total ?? 0} kr`}
          sub={`${monthSales._count} ordre`}
          icon={<TrendingUp size={18} className="text-blue-500" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Aktive varer"
          value={String(products)}
          sub=""
          icon={<Package size={18} className="text-purple-500" />}
          color="bg-purple-50"
        />
        <StatCard
          label="Lav beholdning"
          value={String(lowStock.length)}
          sub="varer"
          icon={<AlertTriangle size={18} className="text-orange-500" />}
          color="bg-orange-50"
          highlight={lowStock.length > 0}
        />
      </div>

      {/* Low stock warnings */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h2 className="font-semibold text-orange-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={16} />
            Lav beholdning — fyll på snart
          </h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="text-orange-900 font-medium">{p.name}</span>
                <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  {p.stockQuantity} igjen (minstegrense: {p.lowStockThreshold})
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/products"
            className="inline-block mt-3 text-orange-700 underline text-sm font-medium"
          >
            Gå til lagerstyring →
          </Link>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={16} />
            Siste 5 ordrer
          </h2>
          <Link href="/admin/orders" className="text-sm text-red-500 font-medium">
            Se alle →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {orders.length === 0 && (
            <p className="p-4 text-gray-400 text-sm">Ingen ordrer ennå</p>
          )}
          {orders.map((order) => (
            <div key={order.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Ordre #{order.id}
                </p>
                <p className="text-xs text-gray-500">
                  {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{order.total} kr</p>
                <p className="text-xs text-gray-400">
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
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`${color} rounded-2xl p-4 ${highlight ? "ring-2 ring-orange-400" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}
