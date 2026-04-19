"use client";

import { useCart } from "./CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string | null;
  stockQuantity: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { add, items, increment } = useCart();
  const cartItem = items.find((i) => i.id === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;
  const outOfStock = product.stockQuantity === 0;

  function handleAdd() {
    if (outOfStock) return;
    if (cartItem) {
      increment(product.id);
    } else {
      add({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 transition-all ${outOfStock ? "opacity-50" : "hover:shadow-md"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
          )}
        </div>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
          {product.category}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xl font-bold text-gray-900">{product.price} kr</span>
        {outOfStock ? (
          <span className="text-sm text-red-500 font-medium">Utsolgt</span>
        ) : (
          <button
            onClick={handleAdd}
            className="relative bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm"
          >
            {inCart > 0 ? (
              <span className="flex items-center gap-1.5">
                Legg til
                <span className="bg-white text-red-500 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {inCart}
                </span>
              </span>
            ) : (
              "Legg til"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
