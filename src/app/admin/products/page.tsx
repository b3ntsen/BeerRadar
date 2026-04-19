import { prisma } from "@/lib/prisma";
import ProductsClient from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <ProductsClient products={products} />;
}
