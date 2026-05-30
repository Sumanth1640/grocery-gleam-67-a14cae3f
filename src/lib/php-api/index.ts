/**
 * PHP API client — drop-in HTTP layer for the PHP backend.
 *
 * Usage: when you migrate the React app to call PHP instead of Lovable Cloud,
 * import from "@/lib/php-api" and replace your serverFn calls one by one.
 *
 * Configure base URL via env:
 *   VITE_PHP_API_BASE=https://yourdomain.com/api
 * Falls back to "/api" for same-domain deployments.
 */

const configuredBase = (import.meta.env.VITE_PHP_API_BASE as string | undefined)?.replace(/\/$/, "");
const LOCAL_XAMPP_BASE =
  "http://localhost/HalliFresh/Phase_1/grocery-gleam-67/php-backend/api";

function baseCandidates(): string[] {
  if (configuredBase) return [configuredBase];

  const isLocalVite =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
    window.location.port !== "";

  return isLocalVite ? [LOCAL_XAMPP_BASE, "/php-backend/api", "/api"] : ["/api"];
}

const TOKEN_KEY = "php_jwt";

export const phpAuth = {
  get: () => (typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type Method = "GET" | "POST";

async function request<T>(path: string, method: Method = "GET", body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = phpAuth.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const tried: string[] = [];
  let lastError: unknown;

  for (const base of baseCandidates()) {
    const url = `${base}${path}`;
    tried.push(url);
    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 120)}`);
      }

      if (!res.ok) throw new Error((data as { error?: string })?.error ?? `HTTP ${res.status}`);
      return data as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `PHP API request failed for ${path}. Tried: ${tried.join(", ")}. ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

import type { Product, Category } from "@/lib/catalog-types";

export const php = {
  // Auth
  signup: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      "/auth/signup.php",
      "POST",
      { email, password },
    ),
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      "/auth/login.php",
      "POST",
      { email, password },
    ),
  me: () => request<{ id: string; email: string }>("/auth/me.php"),

  // Catalog
  products: () => request<Product[]>("/products/list.php"),
  productsByCategory: (category: string) =>
    request<Product[]>(`/products/list.php?category=${encodeURIComponent(category)}`),
  searchProducts: (q: string) =>
    request<Product[]>(`/products/list.php?q=${encodeURIComponent(q)}`),
  product: (slug: string) => request<Product | null>(`/products/get.php?slug=${encodeURIComponent(slug)}`),
  categories: () => request<Category[]>("/categories/list.php"),

  // Cart / Orders
  createOrder: (payload: unknown) => request<{ id: string }>("/orders/create.php", "POST", payload),
  myOrders: () => request<unknown[]>("/orders/list.php"),

  // Addresses
  addresses: () => request<unknown[]>("/addresses/list.php"),
  addAddress: (payload: unknown) => request<{ id: string }>("/addresses/create.php", "POST", payload),
  deleteAddress: (id: string) => request<{ deleted: number }>("/addresses/delete.php", "POST", { id }),

  // Coupons
  coupons: () => request<unknown[]>("/coupons/list.php"),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ discount: number; code: string }>("/coupons/validate.php", "POST", { code, subtotal }),

  // Restaurants
  restaurants: (q?: string) =>
    request<unknown[]>(`/restaurants/list.php${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  restaurantDishes: (slug: string) =>
    request<{ restaurant: unknown; dishes: unknown[] }>(`/restaurants/dishes.php?slug=${encodeURIComponent(slug)}`),

  // Wishlist
  wishlist: () => request<unknown[]>("/wishlist/list.php"),
  toggleWishlist: (product_id: string) =>
    request<{ wishlisted: boolean }>("/wishlist/toggle.php", "POST", { product_id }),

  // Reviews
  reviews: (target_type: "product" | "restaurant" | "dish", target_id: string) =>
    request<{ reviews: unknown[]; avg: number | null; count: number }>(
      `/reviews/list.php?target_type=${target_type}&target_id=${encodeURIComponent(target_id)}`,
    ),
  addReview: (payload: {
    target_type: "product" | "restaurant" | "dish";
    target_id: string;
    rating: number;
    title?: string;
    body?: string;
  }) => request<{ id: string }>("/reviews/create.php", "POST", payload),
  deleteReview: (id: string) => request<{ deleted: number }>("/reviews/delete.php", "POST", { id }),

  // Notifications
  notifications: () =>
    request<{ items: unknown[]; unread: number }>("/notifications/list.php"),
  markNotificationRead: (id?: string) =>
    request<{ updated: number }>("/notifications/mark_read.php", "POST", { id: id ?? null }),
  deleteNotification: (id: string) =>
    request<{ deleted: number }>("/notifications/delete.php", "POST", { id }),

  // Search
  search: (q: string) =>
    request<{ products: unknown[]; restaurants: unknown[]; dishes: unknown[] }>(
      `/search/global.php?q=${encodeURIComponent(q)}`,
    ),

  // Outlets
  outlets: (pincode?: string) =>
    request<unknown[]>(`/outlets/list.php${pincode ? `?pincode=${pincode}` : ""}`),

  // Partner
  partnerOrders: () => request<unknown[]>("/partner/orders.php"),
  updateOrderStatus: (order_id: string, status: string) =>
    request<{ updated: number; status: string }>(
      "/partner/update_order_status.php",
      "POST",
      { order_id, status },
    ),

  // Payments
  createRazorpayOrder: (amount: number) =>
    request<{ id: string; amount: number; currency: string }>(
      "/payments/razorpay_create_order.php",
      "POST",
      { amount },
    ),
};
