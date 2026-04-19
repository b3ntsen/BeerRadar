import { prisma } from "@/lib/prisma";
import KioskShell from "@/components/kiosk/KioskShell";

export const dynamic = "force-dynamic";

export default async function KioskPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const categories = [...new Set(products.map((p) => p.category))];

  return <KioskShell products={products} categories={categories} />;
}
