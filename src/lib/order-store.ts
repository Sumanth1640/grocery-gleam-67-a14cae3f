import { useSyncExternalStore } from "react";
import type { CartItem } from "./cart-types";

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
};

export type PaymentMethod = "upi" | "card" | "cod";

export type Order = {
  id: string;
  items: CartItem[];
  address: Address;
  payment: PaymentMethod;
  subtotal: number;
  delivery: number;
  total: number;
  placedAt: number;
  eta: string;
};

const KEY = "freshcart:lastOrder";

let last: Order | null = (() => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch {
    return null;
  }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") {
    if (last) localStorage.setItem(KEY, JSON.stringify(last));
    else localStorage.removeItem(KEY);
  }
  listeners.forEach((l) => l());
};

export const orderStore = {
  place(order: Order) {
    last = order;
    emit();
  },
  clear() {
    last = null;
    emit();
  },
  getSnapshot: () => last,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useLastOrder() {
  return useSyncExternalStore(orderStore.subscribe, orderStore.getSnapshot, () => null);
}
