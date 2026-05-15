import { useSyncExternalStore } from "react";
import type { Product } from "./catalog-types";

const STORAGE_KEY = "freshcart:recently-viewed";
const MAX = 12;

let state: Product[] = (() => {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.slice(0, MAX) : [];
  } catch {
    return [];
  }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
};

export const recentlyViewedStore = {
  push(product: Product) {
    const filtered = state.filter((p) => p.id !== product.id);
    state = [product, ...filtered].slice(0, MAX);
    emit();
  },
  clear() {
    state = [];
    emit();
  },
  getSnapshot: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

const empty: Product[] = [];
export function useRecentlyViewed() {
  return useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    () => empty,
  );
}
