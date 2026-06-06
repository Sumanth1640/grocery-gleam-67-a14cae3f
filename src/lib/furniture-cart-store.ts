import { useSyncExternalStore } from "react";

export type FurnitureCartLine = {
  id: string;
  slug: string;
  name: string;
  wood: string;
  image: string;
  price: number;
  qty: number;
};

type State = Record<string, FurnitureCartLine>;
const KEY = "furniture:cart";

let state: State = (() => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

export const furnitureCart = {
  add(item: Omit<FurnitureCartLine, "qty">) {
    const ex = state[item.id];
    state = { ...state, [item.id]: { ...item, qty: (ex?.qty ?? 0) + 1 } };
    emit();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) {
      const { [id]: _, ...rest } = state;
      state = rest;
    } else {
      const ex = state[id]; if (!ex) return;
      state = { ...state, [id]: { ...ex, qty } };
    }
    emit();
  },
  remove(id: string) {
    const { [id]: _, ...rest } = state;
    state = rest; emit();
  },
  clear() { state = {}; emit(); },
  getSnapshot: () => state,
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
};

const empty: State = {};
export function useFurnitureCart() {
  return useSyncExternalStore(furnitureCart.subscribe, furnitureCart.getSnapshot, () => empty);
}

export function furnitureTotals(s: State) {
  const lines = Object.values(s);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.price * l.qty, 0);
  return { lines, count, total };
}
