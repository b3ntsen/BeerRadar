"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, AlertTriangle, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
  lowStockThreshold: string;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  category: "Brus",
  stockQuantity: "0",
  lowStockThreshold: "5",
};

const CATEGORIES = ["Brus", "Energidrikk", "Sjokolade", "Snacks", "Annet"];

export default function ProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category: p.category,
      stockQuantity: String(p.stockQuantity),
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editId !== null) {
        const res = await fetch(`/api/products/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Kunne ikke oppdatere");
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === editId ? updated : p)));
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Kunne ikke opprette");
        const created = await res.json();
        setProducts((prev) => [...prev, created]);
      }
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feil");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deaktivere denne varen?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
  }

  async function handleStockUpdate(id: number, delta: number) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newQty = Math.max(0, product.stockQuantity + delta);
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stockQuantity: newQty }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stockQuantity: newQty } : p))
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produkter</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors"
        >
          <Plus size={16} />
          Ny vare
        </button>
      </div>

      {/* Product list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {products.map((p) => {
          const lowStock = p.stockQuantity <= p.lowStockThreshold;
          return (
            <div
              key={p.id}
              className={`px-4 py-3 flex items-center gap-3 ${!p.isActive ? "opacity-40" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  {lowStock && p.isActive && (
                    <AlertTriangle size={14} className="text-orange-500 shrink-0" />
                  )}
                  {!p.isActive && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                      Inaktiv
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {p.category} · {p.price} kr
                </p>
              </div>

              {/* Stock controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStockUpdate(p.id, -1)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm"
                >
                  −
                </button>
                <span
                  className={`w-10 text-center text-sm font-bold ${
                    lowStock ? "text-orange-500" : "text-gray-900"
                  }`}
                >
                  {p.stockQuantity}
                </span>
                <button
                  onClick={() => handleStockUpdate(p.id, 1)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Pencil size={15} />
                </button>
                {p.isActive && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {editId !== null ? "Rediger vare" : "Ny vare"}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <Field label="Navn" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input"
                  required
                />
              </Field>
              <Field label="Beskrivelse">
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pris (kr)" required>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="input"
                    required
                  />
                </Field>
                <Field label="Kategori" required>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lager (antall)">
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                    className="input"
                  />
                </Field>
                <Field label="Varsle ved">
                  <input
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                    className="input"
                  />
                </Field>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {loading ? "Lagrer..." : "Lagre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        .input:focus {
          box-shadow: 0 0 0 2px #fca5a5;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
