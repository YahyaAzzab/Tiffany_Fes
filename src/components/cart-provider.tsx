"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartItem } from "@/lib/types";

const KEY = "tiffany-cart-v1";
const listeners = new Set<() => void>();
let snapshot = "[]";

function readStorage() {
  if (typeof window === "undefined") return snapshot;
  return localStorage.getItem(KEY) ?? "[]";
}

function emit(next: string) {
  snapshot = next;
  localStorage.setItem(KEY, next);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parse(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (item: Omit<CartItem, "key" | "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readStorage, () => "[]");
  const items = useMemo(() => parse(raw), [raw]);

  const value = useMemo<CartContextValue>(() => {
    function write(next: CartItem[]) {
      emit(JSON.stringify(next));
    }
    return {
      items,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      ready: true,
      add(item) {
        const key = `${item.productId}:${item.flavor ?? ""}`;
        const existing = items.find((line) => line.key === key);
        if (!existing) {
          write([...items, { ...item, key, qty: item.qty ?? 1 }]);
          return;
        }
        write(
          items.map((line) =>
            line.key === key ? { ...line, qty: Math.min(12, line.qty + (item.qty ?? 1)) } : line,
          ),
        );
      },
      setQty(key, qty) {
        write(
          qty <= 0
            ? items.filter((line) => line.key !== key)
            : items.map((line) => (line.key === key ? { ...line, qty: Math.min(12, qty) } : line)),
        );
      },
      remove(key) {
        write(items.filter((line) => line.key !== key));
      },
      clear() {
        write([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart doit être utilisé dans CartProvider");
  return value;
}
