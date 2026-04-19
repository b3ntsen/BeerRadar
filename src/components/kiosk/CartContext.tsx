"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; id: number }
  | { type: "INCREMENT"; id: number }
  | { type: "DECREMENT"; id: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "LOAD":
      return { items: action.items };
    case "ADD": {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case "INCREMENT":
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case "DECREMENT":
      return {
        items: state.items
          .map((i) =>
            i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0),
      };
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  add: (product: Omit<CartItem, "quantity">) => void;
  remove: (id: number) => void;
  increment: (id: number) => void;
  decrement: (id: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "elektro4-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) dispatch({ type: "LOAD", items: JSON.parse(stored) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        add: (p) => dispatch({ type: "ADD", product: p }),
        remove: (id) => dispatch({ type: "REMOVE", id }),
        increment: (id) => dispatch({ type: "INCREMENT", id }),
        decrement: (id) => dispatch({ type: "DECREMENT", id }),
        clear: () => dispatch({ type: "CLEAR" }),
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
