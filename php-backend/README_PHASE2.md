# Phase 2 — PHP Backend

## Install

1. In phpMyAdmin, open the `grocery_app` database → **SQL** tab → paste the contents of `schema_phase2.sql` → Go.
2. (Optional, for Razorpay) Edit `config.php` and add at the top:
   ```php
   define('RAZORPAY_KEY_ID',         'rzp_test_xxx');
   define('RAZORPAY_KEY_SECRET',     'xxx');
   define('RAZORPAY_WEBHOOK_SECRET', 'xxx');
   ```

## New endpoints

### Public
- `GET  /api/categories/list.php`
- `GET  /api/coupons/list.php`
- `POST /api/coupons/validate.php`  →  `{ code, subtotal }`
- `GET  /api/restaurants/list.php?q=`
- `GET  /api/restaurants/dishes.php?slug=spice-route`
- `POST /api/payments/razorpay_webhook.php`  *(public; verified via signature)*

### Auth required (`Authorization: Bearer <jwt>`)
- `GET  /api/addresses/list.php`
- `POST /api/addresses/create.php`
- `POST /api/addresses/delete.php`  →  `{ id }`
- `POST /api/payments/razorpay_create_order.php`  →  `{ amount }` (paise)
- `GET  /api/partner/orders.php`
- `POST /api/partner/update_order_status.php`  →  `{ order_id, status }`

## Razorpay webhook URL
Set in Razorpay dashboard → Webhooks:
```
https://YOUR-DOMAIN/api/payments/razorpay_webhook.php
```
Event subscribe: `payment.captured`, `order.paid`. Use `RAZORPAY_WEBHOOK_SECRET`.

When creating the Razorpay order from the client checkout flow, include your
local DB order id in `notes.order_id` so the webhook can mark it paid.

## Quick test
```bash
# Public — should return seeded coupons
curl http://localhost/php-backend/api/coupons/list.php

# Auth — get token from /api/auth/login.php first
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost/php-backend/api/addresses/list.php
```
