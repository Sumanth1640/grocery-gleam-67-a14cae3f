import { useSyncExternalStore } from "react";
import type { Dish, Variant, AddOn, Restaurant } from "./food-data";

export type FoodCartItem = {
  lineId: string; // dish id + variant + sorted addon ids
  dishId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  name: string;
  image: string;
  variant?: { id: string; name: string };
  addons: { id: string; name: string; price: number }[];
  unitPrice: number; // base + addons
  qty: number;
};

type State = Record<string, FoodCartItem>;

const KEY = "freshcart:foodCart";

let state: State = (() => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

export function makeLineId(dishId: string, variantId?: string, addonIds: string[] = []) {
  return [dishId, variantId ?? "_", ...[...addonIds].sort()].join("|");
}

export const foodCartStore = {
  add(restaurant: Restaurant, dish: Dish, variant?: Variant, addons: AddOn[] = []) {
    // single-restaurant cart: clear if switching
    const existing = Object.values(state)[0];
    if (existing && existing.restaurantId !== restaurant.id) {
      state = {};
    }
    const lineId = makeLineId(dish.id, variant?.id, addons.map((a) => a.id));
    const base = variant?.price ?? dish.price;
    const unitPrice = base + addons.reduce((s, a) => s + a.price, 0);
    const prev = state[lineId];
    state = {
      ...state,
      [lineId]: prev
        ? { ...prev, qty: prev.qty + 1 }
        : {
            lineId,
            dishId: dish.id,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            restaurantSlug: restaurant.slug,
            name: dish.name,
            image: dish.image,
            variant: variant ? { id: variant.id, name: variant.name } : undefined,
            addons: addons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
            unitPrice,
            qty: 1,
          },
    };
    emit();
  },
  inc(lineId: string) {
    const it = state[lineId]; if (!it) return;
    state = { ...state, [lineId]: { ...it, qty: it.qty + 1 } };
    emit();
  },
  dec(lineId: string) {
    const it = state[lineId]; if (!it) return;
    if (it.qty <= 1) {
      const { [lineId]: _, ...rest } = state; state = rest;
    } else {
      state = { ...state, [lineId]: { ...it, qty: it.qty - 1 } };
    }
    emit();
  },
  remove(lineId: string) {
    const { [lineId]: _, ...rest } = state; state = rest; emit();
  },
  clear() { state = {}; emit(); },
  getSnapshot: () => state,
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
};

const empty: State = {};
export function useFoodCart() {
  return useSyncExternalStore(foodCartStore.subscribe, foodCartStore.getSnapshot, () => empty);
}

export function foodCartTotals(c: State, discount = 0) {
  const items = Object.values(c);
  const itemsCount = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const delivery = subtotal === 0 ? 0 : subtotal >= 299 ? 0 : 35;
  const packaging = items.length > 0 ? 15 : 0;
  const taxes = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount) + delivery + packaging + taxes;
  return { items, itemsCount, subtotal, delivery, packaging, taxes, discount, total };
}
