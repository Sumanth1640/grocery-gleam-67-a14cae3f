import { useSyncExternalStore } from "react";
import type { Product } from "./catalog-types";

type WishState = Record<string, Product>;
const STORAGE_KEY = "freshcart:wishlist";

let state: WishState = (() => {
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

export const wishlistStore = {
  toggle(product: Product) {
    if (state[product.id]) {
      const { [product.id]: _, ...rest } = state;
      state = rest;
    } else {
      state = { ...state, [product.id]: product };
    }
    emit();
  },
  remove(id: string) {
    if (!state[id]) return;
    const { [id]: _, ...rest } = state;
    state = rest;
    emit();
  },
  clear() {
    state = {};
    emit();
  },
  has(id: string) {
    return !!state[id];
  },
  getSnapshot: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const empty: WishState = {};
export function useWishlist() {
  return useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, () => empty);
}
