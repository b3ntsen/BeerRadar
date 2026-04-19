"use client";

import { useCart } from "./CartContext";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartBar() {
  const { count, total } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <Link
        href="/checkout"
        className="flex items-center justify-between bg-red-500 text-white rounded-2xl px-5 py-4 shadow-xl w-full max-w-lg mx-auto"
      >
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} />
          <span className="font-semibold">{count} vare{count !== 1 ? "r" : ""}</span>
        </div>
        <span className="font-bold text-lg">{total} kr</span>
      </Link>
    </div>
  );
}
