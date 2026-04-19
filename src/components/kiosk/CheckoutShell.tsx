"use client";

import { useCart } from "./CartContext";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";

export default function CheckoutShell() {
  const { items, total, increment, decrement, remove, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleVippsPay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Noe gikk galt");

      if (data.vippsUrl) {
        clear();
        window.location.href = data.vippsUrl;
      } else {
        clear();
        router.push(`/order/${data.orderId}?status=ok`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-500 text-lg">Handlekurven er tom</p>
        <Link href="/" className="text-red-500 font-semibold underline">
          Tilbake til kiosken
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Din handlekurv</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">{item.price} kr/stk</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrement(item.id)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold text-gray-900">{item.quantity}</span>
              <button
                onClick={() => increment(item.id)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 w-16 text-right">
                {item.price * item.quantity} kr
              </span>
              <button
                onClick={() => remove(item.id)}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 space-y-3 max-w-lg mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Totalt</span>
          <span className="text-2xl font-extrabold text-gray-900">{total} kr</span>
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <button
          onClick={handleVippsPay}
          disabled={loading}
          className="w-full bg-[#FF5B24] hover:bg-[#e04e1c] disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Kobler til Vipps...</span>
          ) : (
            <>
              <VippsLogo />
              Betal med Vipps
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function VippsLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="white" fillOpacity="0.3" />
      <text x="12" y="17" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">V</text>
    </svg>
  );
}
