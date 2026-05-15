import { useSyncExternalStore } from "react";
import type { Restaurant } from "./food-data";

type FavRestaurant = Pick<Restaurant, "id" | "slug" | "name" | "image" | "cuisines" | "rating" | "etaMins" | "costForTwo" | "area">;
type State = Record<string, FavRestaurant>;

const KEY = "freshcart:restaurantFavs";

let state: State = (() => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
})();

const listeners = new Set<() => void>();
const emit = () => {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};

export const restaurantFavsStore = {
  toggle(r: Restaurant) {
    if (state[r.id]) {
      const { [r.id]: _, ...rest } = state;
      state = rest;
    } else {
      state = {
        ...state,
        [r.id]: {
          id: r.id, slug: r.slug, name: r.name, image: r.image,
          cuisines: r.cuisines, rating: r.rating, etaMins: r.etaMins,
          costForTwo: r.costForTwo, area: r.area,
        },
      };
    }
    emit();
  },
  remove(id: string) {
    if (!state[id]) return;
    const { [id]: _, ...rest } = state; state = rest; emit();
  },
  has(id: string) { return !!state[id]; },
  getSnapshot: () => state,
  subscribe(fn: () => void) { listeners.add(fn); return () => listeners.delete(fn); },
};

const empty: State = {};
export function useRestaurantFavs() {
  return useSyncExternalStore(restaurantFavsStore.subscribe, restaurantFavsStore.getSnapshot, () => empty);
}
