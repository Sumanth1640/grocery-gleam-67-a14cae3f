# Hostinger Deployment Guide

End-to-end checklist for deploying HalliFresh (React frontend + PHP backend)
to a Hostinger shared-hosting plan.

---

## 0. Prerequisites

- Hostinger account with a domain (e.g. `example.com`) and **MySQL** enabled.
- Local machine with `bun` (or `npm`) installed.
- An FTP/SSH client (Hostinger File Manager works too).

---

## 1. Create the MySQL database

In **hPanel → Databases → MySQL Databases**:

1. Create a database — note **DB name**, **DB user**, **DB password**, **host** (usually `localhost`).
2. Open **phpMyAdmin** for that database.
3. Import the schemas **in order**:
   - `php-backend/schema.sql`
   - `php-backend/schema_phase2.sql`
   - `php-backend/schema_phase3.sql`
   - `php-backend/schema_phase4.sql`
   - `php-backend/schema_phase5.sql`
   - `php-backend/schema_phase6.sql`
   - `php-backend/schema_phase7.sql`
   - `php-backend/schema_phase8.sql`
   - `php-backend/schema_phase9.sql`
   - `php-backend/schema_phase10.sql`
   - `php-backend/schema_phase11.sql` *(rider self-service, coverage, earnings, payouts)*

> **Note on rider tracking:** The PHP backend has no websockets, so the
> customer "live rider" card and the rider dashboard fall back to a 15s
> poll. Everything else (signup → admin approval → outlet assignment →
> nearest-rider ranking → mark-delivered → earnings → payouts) works
> identically to Lovable Cloud.

---

## 2. Configure the PHP backend

Edit **`php-backend/config.php`** before uploading:

```php
define('DB_HOST', 'localhost');               // from Hostinger
define('DB_NAME', 'u123456789_grocery');      // from Hostinger
define('DB_USER', 'u123456789_app');          // from Hostinger
define('DB_PASS', 'YOUR_STRONG_PASSWORD');    // from Hostinger
define('JWT_SECRET', 'GENERATE_A_64_CHAR_RANDOM_STRING_HERE');
```

Generate a secret locally:

```bash
openssl rand -hex 32
```

**Production hardening** — also tighten CORS in `config.php`:

```php
header('Access-Control-Allow-Origin: https://example.com'); // not '*'
```

---

## 3. Upload the PHP backend

Upload the entire **`php-backend/`** folder to your Hostinger account at:

```
/home/<account>/domains/example.com/public_html/php-backend/
```

So endpoints resolve at `https://example.com/php-backend/api/...`.

The bundled `.htaccess` forwards the `Authorization` header to PHP — keep it.

**Permissions:**
- Directories: `755`
- Files: `644`
- `php-backend/uploads/` and subfolders: `755` (writable)

---

## 4. Build the React frontend for PHP mode

On your local machine, in the project root:

```bash
# Tell the build to call PHP instead of Lovable Cloud
echo "VITE_USE_PHP=true" >> .env
echo "VITE_PHP_API_BASE=https://example.com/php-backend/api" >> .env

# Build
bun install
bun run build
```

The output lands in **`dist/`**.

---

## 5. Upload the frontend

Upload **everything inside `dist/`** (not the folder itself) to:

```
/home/<account>/domains/example.com/public_html/
```

So `index.html` sits at `public_html/index.html`, alongside the
`php-backend/` folder from step 3.

**SPA routing** — add this `.htaccess` at `public_html/.htaccess` so deep
links like `/orders/123` resolve to `index.html`:

```apache
RewriteEngine On

# Don't rewrite real files, directories, or the PHP backend
RewriteCond %{REQUEST_URI} ^/php-backend/ [OR]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Everything else → index.html (React Router handles it)
RewriteRule ^ index.html [L]
```

---

## 6. Smoke-test

Visit these URLs in order:

| URL | Expected |
| --- | --- |
| `https://example.com/php-backend/api/categories/list.php` | JSON array |
| `https://example.com/php-backend/api/products/list.php` | JSON array |
| `https://example.com/` | App loads, products visible |
| `https://example.com/login` | Sign-up creates an account, sign-in works |
| `/orders` after placing an order | Order appears in your list |

If `/api/...` 404s, double-check the path matches what you set in
`VITE_PHP_API_BASE`.

If JSON requests return HTML, your `.htaccess` rewrite is intercepting
the API — make sure the `^/php-backend/` exclusion is present.

---

## 7. Razorpay (optional)

If you use payments, set the keys in `php-backend/config.php`:

```php
define('RAZORPAY_KEY_ID', 'rzp_live_...');
define('RAZORPAY_KEY_SECRET', '...');
define('RAZORPAY_WEBHOOK_SECRET', '...');
```

Configure the webhook URL in your Razorpay dashboard to:

```
https://example.com/php-backend/api/payments/razorpay_webhook.php
```

---

## 8. Switching back to Cloud mode for local development

```bash
# Remove (or comment out) the PHP env lines from .env
# VITE_USE_PHP=true
# VITE_PHP_API_BASE=...

bun run dev
```

Without `VITE_USE_PHP=true`, the app falls back to Lovable Cloud
automatically — useful for previewing changes inside Lovable.

---

## What is NOT served by PHP

These features stay on Lovable Cloud and are unavailable in a pure-PHP
Hostinger deployment:

- **Google OAuth sign-in** — requires separate Google Cloud setup.
- **Realtime order updates** — the app polls every 3 s instead.
- **Admin / partner / outlet panels** — keep these on the Lovable preview
  URL; they were not migrated to PHP.

Everything customer-facing (browse, search, cart, checkout, orders,
wishlist, reviews, notifications, addresses, profile, refunds) runs on
PHP.
