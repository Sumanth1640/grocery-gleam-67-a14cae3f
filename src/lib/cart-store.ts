import { useSyncExternalStore } from "react";
import type { Product } from "./products";

type CartItem = { product: Product; qty: number };
type CartState = Record<string, CartItem>;

const STORAGE_KEY = "freshcart:cart";

let state: CartState = (() => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
};

export const cartStore = {
  add(product: Product) {
    const existing = state[product.id];
    state = {
      ...state,
      [product.id]: { product, qty: (existing?.qty ?? 0) + 1 },
    };
    emit();
  },
  remove(id: string) {
    const existing = state[id];
    if (!existing) return;
    if (existing.qty <= 1) {
      const { [id]: _, ...rest } = state;
      state = rest;
    } else {
      state = { ...state, [id]: { ...existing, qty: existing.qty - 1 } };
    }
    emit();
  },
  clear() {
    state = {};
    emit();
  },
  getSnapshot: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const emptyState: CartState = {};
export function useCart() {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    () => emptyState,
  );
}

export function cartTotals(c: CartState) {
  const items = Object.values(c);
  const itemsCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const savings = mrpTotal - subtotal;
  const delivery = subtotal > 0 && subtotal < 199 ? 25 : 0;
  return { items, itemsCount, subtotal, mrpTotal, savings, delivery, total: subtotal + delivery };
}
