# Promotional & personalized notifications

Cron-driven push engine for the native customer app.

## What it sends

| Job | Trigger | Cadence |
|---|---|---|
| **coupon** | Any active coupon created in last 7 days | Once per (user, coupon) |
| **surge** | Pincode hit ≥10 orders in last 60 min | Once per pincode per day |
| **wishlist** | Wishlisted product where price < MRP (≥5% off) | Once per (user, product) per ISO week |
| **recommend** | Top category from last 60 days of orders | Once per user per ISO week (fires only between 10:00-10:14 IST) |
| **mealtime** | Breakfast 7-9, lunch 12-14, dinner 19-21 IST | Once per meal per day |

All dedup is enforced by `promo_notification_log` (created automatically on first run, or via `schema_phase13.sql`).

## Setup

1. **Apply schema** (optional — the script auto-creates the dedup table):
   ```sql
   SOURCE php-backend/schema_phase13.sql;
   ```

2. **Set the cron secret** in `php-backend/cron/promo_notifications.php`:
   ```php
   $EXPECTED = 'CHANGE_ME_promo_cron_secret_2026';
   ```

3. **Add a Hostinger cron job** (hPanel → Advanced → Cron Jobs), every 15 minutes:
   ```
   */15 * * * *  curl -s "https://hallifresh.in/php-backend/cron/promo_notifications.php?secret=YOUR_SECRET" > /dev/null
   ```

## Notes

- Only users who have registered an FCM device token receive pushes (no point spamming users who can't receive them).
- Mealtime + recommend jobs only fire during their IST windows; the cron is safe to run every 15 min year-round.
- `recommend` uses MySQL 8 `JSON_TABLE`. On MySQL 5.7 that job is skipped silently (other jobs still run).
- All sends go through `notify_user()`, so each push also appears in the in-app notification bell.

## Manual test

```
curl -s "https://hallifresh.in/php-backend/cron/promo_notifications.php?secret=YOUR_SECRET"
# → {"ok":true,"sent":{"coupon":0,"surge":0,...},"at":"..."}
```
