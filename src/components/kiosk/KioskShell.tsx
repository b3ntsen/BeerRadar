"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import CartBar from "./CartBar";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  stockQuantity: number;
}

interface Props {
  products: Product[];
  categories: string[];
}

export default function KioskShell({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Alle");

  const filtered =
    activeCategory === "Alle"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      <div className="min-h-screen pb-28">
        <header className="bg-red-500 text-white px-4 py-5 text-center shadow-md sticky top-0 z-40">
          <h1 className="text-2xl font-extrabold tracking-tight">Elektro 4 Kiosk</h1>
          <p className="text-red-100 text-sm mt-0.5">Skann QR, velg varer, betal med Vipps</p>
        </header>

        <div className="sticky top-[72px] z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {["Alle", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <main className="px-4 py-4 max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-12">Ingen varer i denne kategorien</p>
          )}
        </main>
      </div>

      <CartBar />
    </>
  );
}
