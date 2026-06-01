import { useSyncExternalStore } from "react";
import type { Product } from "./catalog-types";
import { USE_PHP } from "@/lib/dual-api";
import { php, phpAuth } from "@/lib/php-api";

type WishState = Record<string, Product>;
const STORAGE_KEY = "hallifresh:wishlist";

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

// ---------- PHP server sync ----------
async function hydrateFromServer() {
  if (!USE_PHP || typeof window === "undefined" || !phpAuth.get()) return;
  try {
    const rows = (await php.wishlist()) as Product[];
    const next: WishState = {};
    for (const p of rows) next[p.id] = p;
    state = next;
    emit();
  } catch {
    /* ignore — keep local cache */
  }
}

if (typeof window !== "undefined" && USE_PHP) {
  // Initial hydrate after module load
  void hydrateFromServer();
  // Re-hydrate on login/logout (same- or cross-tab) and on tab focus
  window.addEventListener("storage", (e) => {
    if (e.key === "php_jwt") {
      if (phpAuth.get()) void hydrateFromServer();
      else {
        state = {};
        emit();
      }
    }
  });
  window.addEventListener("focus", () => {
    if (phpAuth.get()) void hydrateFromServer();
  });
}

async function serverToggle(product: Product, nowWishlisted: boolean) {
  if (!USE_PHP || !phpAuth.get()) return;
  try {
    const res = (await php.toggleWishlist(product.id)) as { wishlisted: boolean };
    // Server is source of truth — reconcile if it diverged.
    if (res.wishlisted !== nowWishlisted) {
      if (res.wishlisted) state = { ...state, [product.id]: product };
      else {
        const { [product.id]: _, ...rest } = state;
        state = rest;
      }
      emit();
    }
  } catch {
    // Revert optimistic change on failure.
    if (nowWishlisted) {
      const { [product.id]: _, ...rest } = state;
      state = rest;
    } else {
      state = { ...state, [product.id]: product };
    }
    emit();
  }
}

export const wishlistStore = {
  toggle(product: Product) {
    const willBeWishlisted = !state[product.id];
    if (willBeWishlisted) {
      state = { ...state, [product.id]: product };
    } else {
      const { [product.id]: _, ...rest } = state;
      state = rest;
    }
    emit();
    void serverToggle(product, willBeWishlisted);
  },
  remove(id: string) {
    const product = state[id];
    if (!product) return;
    const { [id]: _, ...rest } = state;
    state = rest;
    emit();
    void serverToggle(product, false);
  },
  clear() {
    const prev = state;
    state = {};
    emit();
    if (USE_PHP && phpAuth.get()) {
      // Server has no bulk-clear; toggle each off.
      for (const p of Object.values(prev)) {
        void php.toggleWishlist(p.id).catch(() => {});
      }
    }
  },
  has(id: string) {
    return !!state[id];
  },
  getSnapshot: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  refresh: hydrateFromServer,
};

const empty: WishState = {};
export function useWishlist() {
  return useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, () => empty);
}
