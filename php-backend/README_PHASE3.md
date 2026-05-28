# Phase 3 — PHP Backend

## Install

In phpMyAdmin → `grocery_app` → **SQL** tab → paste `schema_phase3.sql` → Go.

## New endpoints

### Auth required
- `GET  /api/wishlist/list.php`
- `POST /api/wishlist/toggle.php`           → `{ product_id }`
- `POST /api/reviews/create.php`            → `{ target_type, target_id, rating, title?, body? }`
- `POST /api/reviews/delete.php`            → `{ id }`
- `GET  /api/notifications/list.php`
- `POST /api/notifications/mark_read.php`   → `{ id? }` (omit `id` to mark all)
- `POST /api/notifications/delete.php`      → `{ id }`

### Public
- `GET  /api/reviews/list.php?target_type=product&target_id=xxx`
- `GET  /api/search/global.php?q=apple`     → products + restaurants + dishes
- `GET  /api/outlets/list.php?pincode=400001`

## React swap layer

`src/lib/php-api/index.ts` — typed HTTP client. To swap a component over:

```ts
// Before (Lovable Cloud)
import { listProducts } from "@/lib/catalog.functions";
const products = await listProducts();

// After (PHP)
import { php } from "@/lib/php-api";
const products = await php.products();
```

Configure the base URL via `.env`:
```
VITE_PHP_API_BASE=https://yourdomain.com/api
```
(omit on Hostinger if React is served from same domain → defaults to `/api`)

## Auth flow

```ts
import { php, phpAuth } from "@/lib/php-api";

// Login
const { token } = await php.login(email, password);
phpAuth.set(token);     // saved to localStorage

// Subsequent calls auto-attach Bearer token
const me = await php.me();

// Logout
phpAuth.clear();
```

## What's still on Lovable Cloud (not yet ported)

- Realtime order alerts (use polling on PHP — call `php.notifications()` every 10s)
- Google OAuth login (PHP version needs separate setup with Google API)
- File uploads to storage (Hostinger File Manager handles uploads; would need an `upload.php` endpoint)
- pg_cron jobs (use Hostinger's cron job UI instead)
- Admin RLS-based row scoping (PHP enforces via `current_user_id()` in each handler)

That's the complete server surface. Phase 4 (optional) would migrate the React components themselves to call `php.*` instead of `serverFn`. Want me to do that?
