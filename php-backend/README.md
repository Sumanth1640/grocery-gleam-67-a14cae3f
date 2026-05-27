# PHP Backend (Phase 1)

A minimal PHP + MySQL backend that mirrors the core of your Lovable Cloud app.
Drop this folder on **Hostinger** (or run locally with **XAMPP**) to test.

## What's included (Phase 1)

```
php-backend/
├── schema.sql           # MySQL schema (users, products, orders, addresses)
├── config.php           # DB connection + helpers (CORS, JSON, JWT)
├── api/
│   ├── auth/
│   │   ├── signup.php   # POST email+password → user + JWT
│   │   ├── login.php    # POST email+password → JWT
│   │   └── me.php       # GET (Bearer token) → current user
│   ├── products/
│   │   ├── list.php     # GET → all products
│   │   └── get.php      # GET ?slug=xxx → single product
│   └── orders/
│       ├── create.php   # POST (auth) → place order
│       └── list.php     # GET (auth) → my orders
└── .htaccess            # Pretty URLs + CORS preflight
```

**Not yet ported** (will come in Phase 2/3):
Razorpay webhooks, Google OAuth, realtime, partner/outlet/warehouse panels, coupons, refunds, reviews, file uploads, notifications.

---

## Local setup (XAMPP / Laragon)

1. Install **XAMPP** → start Apache + MySQL.
2. Copy this `php-backend/` folder into `htdocs/` (so it lives at `http://localhost/php-backend`).
3. Open **phpMyAdmin** → create database `grocery_app` → import `schema.sql`.
4. Edit `config.php` — set DB creds + a strong `JWT_SECRET`.
5. Test: open `http://localhost/php-backend/api/products/list.php` → should return `[]`.

## Hostinger setup

1. **hPanel → Databases → MySQL Databases** → create DB + user. Note host/name/user/pass.
2. **hPanel → Files → File Manager** → upload `php-backend/` to `public_html/api/` (or wherever you want).
3. **phpMyAdmin** → import `schema.sql`.
4. Edit `config.php` on the server with your real DB creds and JWT secret.
5. Test: `https://yourdomain.com/api/products/list.php`.

## Frontend integration

Change your React app's API base URL to point at this backend instead of Lovable Cloud:

```ts
// e.g. src/lib/api.ts (new file you'd add when migrating)
const API_BASE = "https://yourdomain.com/api";

export async function login(email: string, password: string) {
  const r = await fetch(`${API_BASE}/auth/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return r.json(); // { token, user }
}
```

Store the returned JWT in `localStorage` and send it as `Authorization: Bearer <token>` on protected endpoints.

---

## Security notes

- Passwords are hashed with `password_hash()` (bcrypt).
- JWT is HS256 with a 7-day expiry — rotate `JWT_SECRET` to invalidate all sessions.
- **Change `JWT_SECRET` in production.** Don't commit real secrets to GitHub.
- This is a starting point — add rate-limiting (Hostinger has basic protection, but consider Cloudflare in front) before launch.
