# Phase 4 — Dual-Mode React → PHP

The React app now runs in **two modes** controlled by one env var:

| Mode | Trigger | Backend | Use when |
|------|---------|---------|----------|
| Cloud (default) | `VITE_USE_PHP` unset/false | Lovable Cloud / Supabase | Working in Lovable preview |
| PHP | `VITE_USE_PHP=true` | XAMPP / Hostinger PHP | Deploying to Hostinger |

## Building for Hostinger

1. Set in `.env` (or `.env.production`):

   ```
   VITE_USE_PHP=true
   VITE_PHP_API_BASE=https://yourdomain.com/api
   ```

2. `bun run build` → `dist/` folder.
3. Upload `dist/*` to Hostinger `public_html/`.
4. Upload `php-backend/` to `public_html/api/` (so `/api/wishlist/list.php` resolves).
5. Import `schema.sql` + `schema_phase2.sql` + `schema_phase3.sql` into your MySQL DB via phpMyAdmin.
6. Edit `php-backend/config.php` with your Hostinger MySQL credentials.

## Files added

- `src/lib/dual-api.ts` — central adapter, exports `dualApi.*`
- `src/lib/use-dual-auth.ts` — replacement for `useAuth()`
- `src/lib/php-api/index.ts` — typed PHP HTTP client (Phase 3)

## Already swapped

- `src/routes/login.tsx` — signup/signin go through `dualApi`

## Migration recipes (copy-paste)

Apply to each component that currently calls a `*.functions.ts` directly.
Components keep working in **both modes** after the swap.

### Catalog

```ts
// Before
import { listProducts, listCategories, getProduct, searchProducts } from "@/lib/catalog.functions";
const p = await listProducts();
const cat = await listCategories();
const one = await getProduct({ data: { slug } });
const hits = await searchProducts({ data: { q } });

// After
import { dualApi } from "@/lib/dual-api";
const p = await dualApi.listProducts();
const cat = await dualApi.listCategories();
const one = await dualApi.getProduct(slug);
const hits = (await dualApi.search(q)).products;
```

**Files to update:** `src/routes/index.tsx`, `src/routes/c.$slug.tsx`,
`src/routes/p.$id.tsx`, `src/routes/search.tsx`,
`src/components/site/ProductGrid.tsx` consumers.

### Auth

```ts
// Before
import { useAuth } from "@/lib/use-auth";
const { user, loading } = useAuth();
await supabase.auth.signOut();

// After
import { useDualAuth } from "@/lib/use-dual-auth";
import { dualApi } from "@/lib/dual-api";
const { user, loading } = useDualAuth();
await dualApi.signout();
```

**Files to update:** Anywhere `useAuth` is imported (Header, account routes,
`_authenticated.tsx` guard, etc.).

> ⚠️ The `_authenticated.tsx` route guard uses Supabase session directly.
> In PHP mode you'll need to swap it to check `phpAuth.get()` instead.
> Easiest: replace its `beforeLoad` with a component-level redirect using
> `useDualAuth()`.

### Cart & checkout

```ts
// Before
import { placeOrder } from "@/lib/fulfillment.functions";
import { listAddresses, createAddress, deleteAddress } from "@/lib/account.functions";
import { validateCoupon } from "@/lib/coupons.functions";

// After
import { dualApi } from "@/lib/dual-api";
await dualApi.createOrder(payload);
await dualApi.listAddresses();
await dualApi.addAddress(payload);
await dualApi.deleteAddress(id);
await dualApi.validateCoupon(code, subtotal);
```

**Files to update:** `src/routes/checkout.tsx`, `src/routes/cart.tsx`,
`src/components/site/AddressDialog.tsx`,
`src/components/site/SavedAddressPicker.tsx`,
`src/routes/_authenticated/orders.tsx`.

### Wishlist

```ts
// Before
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";

// After (server-backed via PHP, local-only in Cloud mode)
import { dualApi } from "@/lib/dual-api";
const items = await dualApi.wishlist();
await dualApi.toggleWishlist(productId);
```

**File:** `src/routes/wishlist.tsx`.

### Reviews

```ts
// Before
import { listReviews, upsertReview, reviewSummary } from "@/lib/reviews.functions";

// After
import { dualApi } from "@/lib/dual-api";
const { reviews, avg, count } = await dualApi.listReviews("product", productId);
await dualApi.addReview({ target_type: "product", target_id: productId, rating: 5, body: "..." });
```

**File:** `src/components/site/ReviewsSection.tsx`.

### Notifications

```ts
// Before
import { listNotifications, markRead } from "@/lib/notifications.functions";

// After
import { dualApi } from "@/lib/dual-api";
const { items, unread } = await dualApi.notifications();
await dualApi.markNotificationRead();             // mark ALL
await dualApi.markNotificationRead(notificationId); // mark one
```

**File:** `src/routes/_authenticated/notifications.tsx`,
`src/components/site/Header.tsx` (bell badge).

### Restaurants

```ts
// Before
import { listApprovedRestaurants } from "@/lib/partner-public.functions";

// After
import { dualApi } from "@/lib/dual-api";
const list = await dualApi.restaurants(searchQuery);
```

**File:** `src/routes/food/index.tsx`.

## What's NOT in dual-api (still Lovable Cloud only)

- Admin panel (`/_authenticated/admin/*`) — keep on Cloud, you won't expose it
  on Hostinger
- Partner dashboard
- Google OAuth (PHP version requires separate Google Cloud setup)
- Realtime subscriptions (poll via `setInterval(() => dualApi.notifications(), 10_000)`
  in PHP mode)
- Razorpay webhook (lives at `/api/payments/razorpay_webhook.php` in PHP mode)
- File uploads (use Hostinger File Manager or build a separate `upload.php`)

## Testing the swap

```bash
# Cloud mode (default) — preview keeps working
bun run dev

# PHP mode — needs PHP running at the configured base URL
echo "VITE_USE_PHP=true" >> .env
echo "VITE_PHP_API_BASE=http://localhost/HalliFresh/Phase_1/grocery-gleam-67/php-backend/api" >> .env
bun run dev
# now visit http://localhost:5173 — calls go to XAMPP
```

When done testing locally, remove the env lines (or set `VITE_USE_PHP=false`)
to flip back to Cloud mode.
