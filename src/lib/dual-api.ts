/**
 * Dual-mode API adapter — Phase 4.
 *
 * Routes every data call to either Lovable Cloud (default, so the Lovable
 * preview keeps working) or the PHP backend (for Hostinger deployment).
 *
 * Toggle by adding to .env BEFORE building for Hostinger:
 *
 *     VITE_USE_PHP=true
 *     VITE_PHP_API_BASE=https://yourdomain.com/api
 *
 * Then `bun run build` and upload `dist/` to Hostinger alongside `php-backend/`.
 *
 * --------------------------------------------------------------------------
 * USAGE in components — replace direct serverFn imports with `dualApi.*`:
 *
 *   // before
 *   import { listProducts } from "@/lib/catalog.functions";
 *   const products = await listProducts();
 *
 *   // after
 *   import { dualApi } from "@/lib/dual-api";
 *   const products = await dualApi.listProducts();
 *
 * The shape returned is identical in both modes, so components don't care.
 */

import { php, phpAuth } from "@/lib/php-api";

// ---------- mode flag ----------
export const USE_PHP =
  (import.meta.env.VITE_USE_PHP as string | undefined)?.toLowerCase() === "true";

// ---------- Lazy Lovable Cloud imports (skipped when USE_PHP) ----------
// We import dynamically so PHP-only builds don't drag Supabase code in.
async function lc() {
  const [catalog, coupons, account, reviews, notifications] = await Promise.all([
    import("@/lib/catalog.functions"),
    import("@/lib/coupons.functions"),
    import("@/lib/account.functions"),
    import("@/lib/reviews.functions"),
    import("@/lib/notifications.functions"),
  ]);
  return { catalog, coupons, account, reviews, notifications };
}

// ---------- the unified API ----------
export const dualApi = {
  mode: USE_PHP ? ("php" as const) : ("cloud" as const),

  // ============ AUTH ============
  async signup(email: string, password: string, fullName?: string) {
    if (USE_PHP) {
      const r = await php.signup(email, password);
      phpAuth.set(r.token);
      return { user: r.user, error: null };
    }
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { user: data.user, error };
  },

  async signin(email: string, password: string) {
    if (USE_PHP) {
      const r = await php.login(email, password);
      phpAuth.set(r.token);
      return { user: r.user, error: null };
    }
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  async signout() {
    if (USE_PHP) {
      phpAuth.clear();
      return;
    }
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
  },

  // ============ CATALOG ============
  async listProducts() {
    if (USE_PHP) return php.products();
    const { listProducts } = (await lc()).catalog;
    return listProducts();
  },

  async listCategories() {
    if (USE_PHP) return php.categories();
    const { listCategories } = (await lc()).catalog;
    return listCategories();
  },

  async getProduct(slug: string) {
    if (USE_PHP) return php.product(slug);
    const { getProduct } = (await lc()).catalog;
    return getProduct({ data: { slug } });
  },

  async search(q: string) {
    if (USE_PHP) return php.search(q);
    const { searchProducts } = (await lc()).catalog;
    const products = await searchProducts({ data: { q } });
    return { products, restaurants: [], dishes: [] };
  },

  // ============ COUPONS ============
  async listCoupons() {
    if (USE_PHP) return php.coupons();
    const { listPublicCoupons } = await import("@/lib/public-coupons.functions");
    return listPublicCoupons();
  },

  async validateCoupon(code: string, subtotal: number) {
    if (USE_PHP) return php.validateCoupon(code, subtotal);
    const { validateCoupon } = (await lc()).coupons;
    return validateCoupon({ data: { code, subtotal } });
  },

  // ============ ADDRESSES ============
  async listAddresses() {
    if (USE_PHP) return php.addresses();
    const { listAddresses } = (await lc()).account;
    return listAddresses();
  },

  async addAddress(payload: Record<string, unknown>) {
    if (USE_PHP) return php.addAddress(payload);
    const { upsertAddress } = (await lc()).account;
    return upsertAddress({ data: payload as never });
  },

  async deleteAddress(id: string) {
    if (USE_PHP) return php.deleteAddress(id);
    const { deleteAddress } = (await lc()).account;
    return deleteAddress({ data: { id } });
  },

  // ============ ORDERS ============
  async createOrder(payload: Record<string, unknown>) {
    if (USE_PHP) return php.createOrder(payload);
    const { createOrder } = await import("@/lib/fulfillment.functions");
    return createOrder({ data: payload as never });
  },

  async myOrders() {
    if (USE_PHP) return php.myOrders();
    const { listMyOrders } = await import("@/lib/account.functions");
    return listMyOrders();
  },

  // ============ WISHLIST ============
  async wishlist() {
    if (USE_PHP) return php.wishlist();
    // Lovable Cloud mode uses the local wishlist-store (no server table)
    const { wishlistStore } = await import("@/lib/wishlist-store");
    return Object.values(wishlistStore.snapshot());
  },

  async toggleWishlist(product_id: string) {
    if (USE_PHP) return php.toggleWishlist(product_id);
    return { wishlisted: true };
  },

  // ============ REVIEWS ============
  async listReviews(target_type: "product" | "restaurant" | "dish", target_id: string) {
    if (USE_PHP) return php.reviews(target_type, target_id);
    const { listReviews } = (await lc()).reviews;
    const items = await listReviews({ data: { target_type, target_id } });
    return { reviews: items, avg: null, count: items.length };
  },

  async addReview(payload: {
    target_type: "product" | "restaurant" | "dish";
    target_id: string;
    rating: number;
    title?: string;
    body?: string;
  }) {
    if (USE_PHP) return php.addReview(payload);
    const { createReview } = (await lc()).reviews;
    return createReview({ data: payload });
  },

  // ============ NOTIFICATIONS ============
  async notifications() {
    if (USE_PHP) return php.notifications();
    const { listNotifications } = (await lc()).notifications;
    const items = await listNotifications();
    return { items, unread: items.filter((n: { read?: boolean }) => !n.read).length };
  },

  async markNotificationRead(id?: string) {
    if (USE_PHP) return php.markNotificationRead(id);
    const { markRead } = (await lc()).notifications;
    return markRead({ data: { id: id ?? null } });
  },

  // ============ RESTAURANTS ============
  async restaurants(q?: string) {
    if (USE_PHP) return php.restaurants(q);
    const { listRestaurants } = await import("@/lib/partner-public.functions");
    return listRestaurants({ data: { q: q ?? "" } });
  },
};
