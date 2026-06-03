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

  async productsByCategory(slug: string) {
    if (USE_PHP) return php.productsByCategory(slug);
    const { productsByCategory } = (await lc()).catalog;
    return productsByCategory({ data: { slug } });
  },

  async getProduct(slug: string) {
    if (USE_PHP) return php.product(slug);
    const { getProduct } = (await lc()).catalog;
    return getProduct({ data: { slug } });
  },

  async searchProducts(q: string) {
    if (USE_PHP) return php.searchProducts(q);
    const { searchProducts } = (await lc()).catalog;
    return searchProducts({ data: { q } });
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
    // Lovable Cloud has no public validate endpoint — fall through to client-side
    return { discount: 0, code };
  },

  // ============ ADDRESSES ============
  async listAddresses() {
    if (USE_PHP) return php.addresses();
    const { listAddresses } = (await lc()).account;
    return listAddresses();
  },

  async addAddress(payload: Record<string, unknown>) {
    if (USE_PHP) return php.addAddress(payload);
    const { createAddress } = (await lc()).account;
    return createAddress({ data: payload as never });
  },

  async updateAddress(payload: Record<string, unknown> & { id: string }) {
    if (USE_PHP) return php.updateAddress(payload);
    const { updateAddress } = await import("@/lib/account.functions");
    return updateAddress({ data: payload as never });
  },

  async deleteAddress(id: string) {
    if (USE_PHP) return php.deleteAddress(id);
    const { deleteAddress } = (await lc()).account;
    return deleteAddress({ data: { id } });
  },

  // ============ ORDERS ============
  async createOrder(payload: Record<string, unknown>) {
    if (USE_PHP) return php.createOrder(payload);
    const { placeOrder } = (await lc()).account;
    return placeOrder({ data: payload as never });
  },

  async myOrders() {
    if (USE_PHP) return php.myOrders();
    const { listOrders } = (await lc()).account;
    return listOrders();
  },

  async getOrder(id: string) {
    if (USE_PHP) return php.getOrder(id);
    const { getOrder } = await import("@/lib/account.functions");
    return getOrder({ data: { id } });
  },

  // ============ COUPONS (cont.) ============
  async myCouponUsage() {
    if (USE_PHP) return php.myCouponUsage();
    const { listMyCouponUsage } = await import("@/lib/coupons.functions");
    return listMyCouponUsage();
  },

  // ============ FULFILLMENT ============
  async resolveWarehouse(pincode: string) {
    if (USE_PHP) return php.resolveWarehouse(pincode);
    const { resolveWarehouseForPincode } = await import("@/lib/fulfillment.functions");
    return resolveWarehouseForPincode({ data: { pincode } });
  },

  async resolveOutlet(restaurant_id: string, lat?: number | null, lng?: number | null) {
    if (USE_PHP) return php.resolveOutlet(restaurant_id, lat, lng);
    const { resolveOutletForRestaurant } = await import("@/lib/fulfillment.functions");
    return resolveOutletForRestaurant({ data: { restaurant_id, lat: lat ?? null, lng: lng ?? null } });
  },

  // ============ PAYMENTS ============
  async createRazorpayOrder(amount: number) {
    if (USE_PHP) return php.createRazorpayOrder(amount);
    const { createRazorpayOrder } = await import("@/lib/razorpay.functions");
    return createRazorpayOrder({ data: { amount } });
  },

  async verifyAndPlaceOrder(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order: unknown;
  }) {
    if (USE_PHP) return php.verifyAndPlaceOrder(payload);
    const { verifyAndPlaceOrder } = await import("@/lib/razorpay.functions");
    return verifyAndPlaceOrder({ data: payload as never });
  },

  // ============ WISHLIST ============
  async wishlist() {
    if (USE_PHP) return php.wishlist();
    const { wishlistStore } = await import("@/lib/wishlist-store");
    return Object.values(wishlistStore.getSnapshot());
  },

  async toggleWishlist(product_id: string) {
    if (USE_PHP) return php.toggleWishlist(product_id);
    return { wishlisted: true };
  },

  // ============ REVIEWS ============
  async listReviews(target_type: "product" | "restaurant" | "dish", target_id: string) {
    if (USE_PHP) return php.reviews(target_type, target_id);
    const { listReviews, reviewSummary } = (await lc()).reviews;
    const [items, summary] = await Promise.all([
      listReviews({ data: { target_type, target_id } }),
      reviewSummary({ data: { target_type, target_id } }),
    ]);
    return { reviews: items, avg: summary?.avg ?? null, count: summary?.count ?? items.length };
  },

  async addReview(payload: {
    target_type: "product" | "restaurant" | "dish";
    target_id: string;
    rating: number;
    title?: string | null;
    body?: string | null;
  }) {
    if (USE_PHP) return php.addReview(payload);
    const { upsertReview } = (await lc()).reviews;
    return upsertReview({ data: payload as never });
  },

  async deleteReview(target_type: "product" | "restaurant" | "dish", target_id: string) {
    if (USE_PHP) return php.deleteReview({ target_type, target_id });
    const { deleteReview } = (await lc()).reviews;
    return deleteReview({ data: { target_type, target_id } });
  },

  // ============ NOTIFICATIONS ============
  async notifications() {
    if (USE_PHP) return php.notifications();
    const { listNotifications, unreadCount } = (await lc()).notifications;
    const [items, unread] = await Promise.all([listNotifications(), unreadCount()]);
    return { items, unread: unread ?? 0 };
  },

  async markNotificationRead(id?: string) {
    if (USE_PHP) return php.markNotificationRead({ id });
    const { markRead } = (await lc()).notifications;
    return markRead({ data: { id: id ?? null } as never });
  },

  // ============ RESTAURANTS ============
  async restaurants(q?: string) {
    if (USE_PHP) return php.restaurants(q);
    const { listApprovedRestaurants } = await import("@/lib/partner-public.functions");
    return listApprovedRestaurants({ data: { q: q ?? "" } as never });
  },

  async allDishes() {
    if (USE_PHP) {
      const list = (await php.restaurants()) as Array<{ slug: string }>;
      const all = await Promise.all(
        list.map((r) => php.restaurantDishes(r.slug).catch(() => null)),
      );
      const flat: unknown[] = [];
      for (const r of all) {
        if (!r) continue;
        const restaurant = { ...r } as Record<string, unknown>;
        const dishes = (restaurant.partner_dishes as Array<Record<string, unknown>>) ?? [];
        delete restaurant.partner_dishes;
        for (const d of dishes) {
          flat.push({ ...d, restaurant });
        }
      }
      return flat;
    }
    const { listAllApprovedDishes } = await import("@/lib/partner-public.functions");
    return listAllApprovedDishes();
  },

  async getRestaurant(slug: string) {
    if (USE_PHP) return php.restaurantDishes(slug);
    const { getApprovedRestaurant } = await import("@/lib/partner-public.functions");
    return getApprovedRestaurant({ data: { slug } });
  },
};

