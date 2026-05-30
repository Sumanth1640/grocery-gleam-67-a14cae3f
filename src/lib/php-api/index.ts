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

  // Profile
  getProfile: () =>
    request<{ id: string; email: string; full_name: string | null; phone: string | null; avatar_url: string | null }>(
      "/profile/get.php",
    ),
  updateProfile: (payload: { full_name?: string; phone?: string }) =>
    request<{ updated: number }>("/profile/update.php", "POST", payload),
  setDefaultAddress: (id: string) =>
    request<{ updated: number }>("/addresses/set_default.php", "POST", { id }),

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
  getOrder: (id: string) => request<Record<string, unknown>>(`/orders/get.php?id=${encodeURIComponent(id)}`),

  // Addresses
  addresses: () => request<Array<Record<string, unknown> & { id: string }>>("/addresses/list.php"),
  addAddress: (payload: unknown) => request<{ id: string }>("/addresses/create.php", "POST", payload),
  updateAddress: (payload: unknown) => request<{ id: string; updated: number }>("/addresses/update.php", "POST", payload),
  deleteAddress: (id: string) => request<{ deleted: number }>("/addresses/delete.php", "POST", { id }),

  // Coupons
  coupons: () => request<unknown[]>("/coupons/list.php"),
  validateCoupon: (code: string, subtotal: number) =>
    request<{ discount: number; code: string }>("/coupons/validate.php", "POST", { code, subtotal }),
  myCouponUsage: () => request<Record<string, number>>("/coupons/my_usage.php"),

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
    title?: string | null;
    body?: string | null;
  }) => request<{ id: string }>("/reviews/create.php", "POST", payload),
  deleteReview: (payload: {
    target_type: "product" | "restaurant" | "dish";
    target_id: string;
  }) => request<{ deleted: number }>("/reviews/delete.php", "POST", payload),

  // Notifications
  notifications: () =>
    request<{ items: Array<Record<string, unknown>>; unread: number }>("/notifications/list.php"),
  notificationsList: async () => {
    const r = await request<{ items: Array<Record<string, unknown> & { is_read?: boolean }>; unread: number }>(
      "/notifications/list.php",
    );
    return r.items.map((n) => ({ ...n, read: n.is_read ?? false }));
  },
  markNotificationRead: (payload?: { id?: string | null; all?: boolean }) =>
    request<{ updated: number }>("/notifications/mark_read.php", "POST", {
      id: payload?.all ? null : payload?.id ?? null,
    }),
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

  // Fulfillment
  resolveWarehouse: (pincode: string) =>
    request<{ serviceable: boolean; warehouse: { id: string; name: string; code: string; city: string; pincode: string } | null }>(
      "/fulfillment/resolve_warehouse.php",
      "POST",
      { pincode },
    ),
  resolveOutlet: (restaurant_id: string, lat?: number | null, lng?: number | null) =>
    request<{ outlet: { id: string; name: string; area: string | null; pincode: string | null; eta_mins: number | null } | null }>(
      "/fulfillment/resolve_outlet.php",
      "POST",
      { restaurant_id, lat: lat ?? null, lng: lng ?? null },
    ),

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
    request<{ order_id: string; amount: number; currency: string; key_id: string }>(
      "/payments/razorpay_create_order.php",
      "POST",
      { amount },
    ),
  verifyAndPlaceOrder: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order: unknown;
  }) => request<{ id: string; created_at: string }>("/payments/razorpay_verify.php", "POST", payload),

  // Public banners
  banners: () => request<unknown[]>("/banners/list.php"),

  // Refunds (user)
  createRefund: (payload: { order_id: string; reason: string; details?: string; amount?: number }) =>
    request<{ id: string }>("/refunds/create.php", "POST", payload),
  myRefundForOrder: (order_id: string) =>
    request<Record<string, unknown> | null>("/refunds/my_for_order.php", "POST", { order_id }),

  // ---------- Admin ----------
  admin: {
    stats: () => request<{ products: number; categories: number; orders: number; revenue: number }>("/admin/stats.php"),
    // products
    listProducts: () => request<any[]>("/admin/products/list.php"),
    saveProduct:  (p: any) => request<any>("/admin/products/save.php", "POST", p),
    deleteProduct:(id: string) => request<{ ok: true }>("/admin/products/delete.php", "POST", { id }),
    // categories
    listCategories: () => request<any[]>("/admin/categories/list.php"),
    saveCategory:   (p: any) => request<any>("/admin/categories/save.php", "POST", p),
    deleteCategory: (id: string) => request<{ ok: true }>("/admin/categories/delete.php", "POST", { id }),
    // banners
    listBanners: () => request<any[]>("/admin/banners/list.php"),
    saveBanner:  (p: any) => request<any>("/admin/banners/save.php", "POST", p),
    deleteBanner:(id: string) => request<{ ok: true }>("/admin/banners/delete.php", "POST", { id }),
    // orders
    listOrders: () => request<any[]>("/admin/orders/list.php"),
    updateOrderStatus: (p: { id: string; status: string }) =>
      request<{ ok: true; status: string }>("/admin/orders/update_status.php", "POST", p),
    // customers
    listCustomers:   (p?: { q?: string }) => request<any[]>("/admin/customers/list.php", "POST", { q: p?.q ?? "" }),
    setCustomerBlocked: (p: { id: string; is_blocked: boolean }) =>
      request<{ ok: true }>("/admin/customers/set_blocked.php", "POST", { user_id: p.id, blocked: p.is_blocked }),
    setUserRole: (p: { user_id: string; role: "admin" | "moderator" | "user" | "customer" | "restaurant"; grant: boolean }) =>
      request<{ ok: true }>("/admin/customers/set_role.php", "POST", p),
    // refunds
    listRefunds:   (p?: { status?: string }) => request<any[]>("/admin/refunds/list.php", "POST", { status: p?.status ?? "" }),
    resolveRefund: (p: { id: string; status: string; admin_note?: string }) =>
      request<{ ok: true }>("/admin/refunds/resolve.php", "POST", p),
    // inventory
    lowStock:    () => request<any[]>("/admin/inventory/low_stock.php"),
    reorderStock:(p: { product_id: string; warehouse_id: string; add_qty: number }) =>
      request<{ ok: true; qty: number }>("/admin/inventory/reorder.php", "POST", p),
    // riders
    listRiders:  () => request<any[]>("/admin/riders/list.php"),
    saveRider:   (p: any) => request<any>("/admin/riders/save.php", "POST", p),
    deleteRider: (p: { id: string }) => request<{ ok: true }>("/admin/riders/delete.php", "POST", p),
    // assignments
    assignableOrders: () => request<any[]>("/admin/assignments/assignable.php"),
    assignRider:      (p: { order_id: string; rider_id: string }) =>
      request<{ ok: true }>("/admin/assignments/assign.php", "POST", p),
    updateAssignment: (p: { order_id: string; status: string }) =>
      request<{ ok: true }>("/admin/assignments/update.php", "POST", p),
    // restaurants
    listRestaurants:   (p?: { status?: string }) => request<any[]>("/admin/restaurants/list.php", "POST", { status: p?.status ?? "" }),
    setRestaurantStatus:  (p: { id: string; status: string; commission_rate?: number; rejection_reason?: string | null }) =>
      request<{ ok: true }>("/admin/restaurants/set_status.php", "POST", p),
    setRestaurantBlocked: (p: { id: string; is_blocked: boolean }) =>
      request<{ ok: true }>("/admin/restaurants/set_blocked.php", "POST", p),
    getDocSignedUrl: (p: { path: string }) =>
      // PHP backend serves uploaded docs publicly; just return the URL as-is.
      Promise.resolve({ url: p.path }),
    // analytics / settlements / reports
    analytics:   (p?: { days?: number }) => request<any>("/admin/analytics.php",   "POST", { days: p?.days ?? 30 }),
    settlements: (p?: { days?: number }) => request<any[]>("/admin/settlements.php","POST", { days: p?.days ?? 30 }),
    reports:     (p?: { days?: number }) => request<any>("/admin/reports.php",     "POST", { days: p?.days ?? 90 }),
    // team
    listTeam:        () => request<{ users: any[]; warehouses: any[] }>("/admin/team/list.php"),
    findUserByEmail: (p: { email: string }) => request<{ id: string; email: string }>("/admin/team/find_user.php", "POST", p),
    grantAdmin:      (p: { user_id: string }) => request<{ ok: true }>("/admin/team/grant_admin.php",  "POST", p),
    revokeAdmin:     (p: { user_id: string }) => request<{ ok: true }>("/admin/team/revoke_admin.php", "POST", p),
    setUserWarehouses: (p: { user_id: string; warehouse_ids: string[] }) =>
      request<{ ok: true; added: number; removed: number }>("/admin/team/set_warehouses.php", "POST", p),
  },
};


