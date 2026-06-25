<?php
// =============================================================================
// Promotional & personalized push notifications engine
// =============================================================================
// Run via Hostinger cron every 15 minutes:
//   curl -s "https://hallifresh.in/php-backend/cron/promo_notifications.php?secret=YOUR_SECRET"
//
// Jobs (each uses promo_notification_log to avoid spam):
//   1. coupon       — new active coupon → broadcast once per (user, coupon)
//   2. surge        — pincode with high order volume in last hour → notify
//                     customers with addresses in that pincode (max 1/day/pin)
//   3. wishlist     — wishlisted product currently discounted → 1/week/(user,product)
//   4. recommend    — weekly personalized push based on top ordered category
//   5. mealtime     — breakfast (7-9 IST), lunch (12-14), dinner (19-21) — 1/day/meal
// =============================================================================

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../notification_helpers.php';

// --- Auth: shared secret in ?secret= or X-Cron-Secret header ----------------
$EXPECTED = 'CHANGE_ME_promo_cron_secret_2026'; // EDIT THIS, match in Hostinger cron URL
$got = $_GET['secret'] ?? ($_SERVER['HTTP_X_CRON_SECRET'] ?? '');
if (!$EXPECTED || !hash_equals($EXPECTED, (string)$got)) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']); exit;
}

date_default_timezone_set('Asia/Kolkata');
@set_time_limit(120);

// --- Ensure dedup table ------------------------------------------------------
try {
  db()->exec("CREATE TABLE IF NOT EXISTS promo_notification_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    kind VARCHAR(32) NOT NULL,
    ref_key VARCHAR(160) NOT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_kind_ref (user_id, kind, ref_key),
    INDEX idx_sent (sent_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Throwable $e) { /* ignore */ }

function already_sent(string $user_id, string $kind, string $ref): bool {
  try {
    $st = db()->prepare('SELECT 1 FROM promo_notification_log WHERE user_id=? AND kind=? AND ref_key=? LIMIT 1');
    $st->execute([$user_id, $kind, $ref]);
    return (bool)$st->fetchColumn();
  } catch (Throwable $e) { return false; }
}

function mark_sent(string $user_id, string $kind, string $ref): void {
  try {
    $st = db()->prepare('INSERT IGNORE INTO promo_notification_log (user_id, kind, ref_key) VALUES (?,?,?)');
    $st->execute([$user_id, $kind, $ref]);
  } catch (Throwable $e) { /* ignore */ }
}

function send_promo(string $user_id, string $kind, string $ref, string $title, string $body, string $link): bool {
  if (already_sent($user_id, $kind, $ref)) return false;
  mark_sent($user_id, $kind, $ref);
  notify_user($user_id, $kind, $title, $body, $link);
  return true;
}

// Active customer ids = users who have a registered device token (so we don't
// hit the FCM endpoint for users who can't receive pushes anyway).
function active_user_ids(?string $pincode = null): array {
  try {
    if ($pincode) {
      $sql = "SELECT DISTINCT dt.user_id
                FROM device_tokens dt
                JOIN addresses a ON a.user_id = dt.user_id
               WHERE dt.user_id IS NOT NULL AND a.pincode = ?";
      $st = db()->prepare($sql);
      $st->execute([$pincode]);
    } else {
      $st = db()->query("SELECT DISTINCT user_id FROM device_tokens WHERE user_id IS NOT NULL");
    }
    return array_map(fn($r) => (string)$r['user_id'], $st->fetchAll(PDO::FETCH_ASSOC));
  } catch (Throwable $e) { return []; }
}

$report = ['coupon' => 0, 'surge' => 0, 'wishlist' => 0, 'recommend' => 0, 'mealtime' => 0, 'errors' => []];

// =============================================================================
// 1) COUPON ALERTS — new/active coupons
// =============================================================================
try {
  $st = db()->query("SELECT id, code, title, description, expires_at
                       FROM coupons
                      WHERE is_active = 1
                        AND (expires_at IS NULL OR expires_at > NOW())
                        AND created_at > (NOW() - INTERVAL 7 DAY)");
  $coupons = $st->fetchAll(PDO::FETCH_ASSOC);
  if ($coupons) {
    $users = active_user_ids();
    foreach ($coupons as $c) {
      $ref = 'coupon:' . $c['id'];
      $title = '🎁 ' . $c['title'];
      $exp = $c['expires_at'] ? ' Ends ' . date('M j', strtotime($c['expires_at'])) . '.' : '';
      $body = 'Use code ' . $c['code'] . ' at checkout.' . $exp;
      foreach ($users as $uid) {
        if (send_promo($uid, 'coupon', $ref, $title, $body, '/?coupon=' . urlencode($c['code']))) {
          $report['coupon']++;
        }
      }
    }
  }
} catch (Throwable $e) { $report['errors'][] = 'coupon: ' . $e->getMessage(); }

// =============================================================================
// 2) SURGE ALERTS — pincodes with high order volume in last 60 min
// =============================================================================
try {
  // Pull recent orders, group by pincode from JSON address column.
  $st = db()->query("SELECT JSON_UNQUOTE(JSON_EXTRACT(address, '$.pincode')) AS pincode, COUNT(*) AS cnt
                       FROM orders
                      WHERE created_at > (NOW() - INTERVAL 60 MINUTE)
                   GROUP BY pincode
                     HAVING cnt >= 10 AND pincode IS NOT NULL");
  $surges = $st->fetchAll(PDO::FETCH_ASSOC);
  $today = date('Y-m-d');
  foreach ($surges as $s) {
    $pin = (string)$s['pincode'];
    if ($pin === '' || $pin === 'null') continue;
    $ref = 'surge:' . $pin . ':' . $today;
    $title = '⚡ High demand in your area';
    $body  = $s['cnt'] . '+ orders nearby in the last hour. Order soon to lock in faster delivery.';
    foreach (active_user_ids($pin) as $uid) {
      if (send_promo($uid, 'surge', $ref, $title, $body, '/')) $report['surge']++;
    }
  }
} catch (Throwable $e) { $report['errors'][] = 'surge: ' . $e->getMessage(); }

// =============================================================================
// 3) WISHLIST DISCOUNT — wishlisted product with price < mrp
// =============================================================================
try {
  $st = db()->query("SELECT w.user_id, p.id AS pid, p.slug, p.name, p.price, p.mrp
                       FROM wishlist w
                       JOIN products p ON p.id = w.product_id
                      WHERE p.in_stock = 1 AND p.mrp > p.price
                        AND EXISTS (SELECT 1 FROM device_tokens dt WHERE dt.user_id = w.user_id)");
  $week = date('Y\WW');
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $off = (int)round((($row['mrp'] - $row['price']) / max(1, $row['mrp'])) * 100);
    if ($off < 5) continue;
    $ref = 'wishlist:' . $row['pid'] . ':' . $week;
    $title = '❤️ ' . $row['name'] . ' is on sale';
    $body  = $off . '% off — now ₹' . $row['price'] . ' (was ₹' . $row['mrp'] . ').';
    if (send_promo((string)$row['user_id'], 'wishlist', $ref, $title, $body, '/p/' . $row['slug'])) {
      $report['wishlist']++;
    }
  }
} catch (Throwable $e) { $report['errors'][] = 'wishlist: ' . $e->getMessage(); }

// =============================================================================
// 4) PERSONALIZED RECOMMENDATIONS — weekly, based on top ordered category
// =============================================================================
// Only run between 10:00 and 10:14 IST once per user per ISO week.
$hour = (int)date('G');
if ($hour === 10) {
  try {
    $week = date('Y\WW');
    // For each active user, find their most-ordered category in last 60 days.
    $st = db()->query("SELECT dt.user_id
                         FROM device_tokens dt
                        WHERE dt.user_id IS NOT NULL
                     GROUP BY dt.user_id");
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $u) {
      $uid = (string)$u['user_id'];
      $ref = 'recommend:' . $week;
      if (already_sent($uid, 'recommend', $ref)) continue;

      $q = db()->prepare("SELECT JSON_UNQUOTE(JSON_EXTRACT(it.value, '$.product.category_slug')) AS cat,
                                 COUNT(*) AS cnt
                            FROM orders o, JSON_TABLE(o.items, '$[*]' COLUMNS (value JSON PATH '$')) it
                           WHERE o.user_id = ?
                             AND o.created_at > (NOW() - INTERVAL 60 DAY)
                        GROUP BY cat ORDER BY cnt DESC LIMIT 1");
      try { $q->execute([$uid]); } catch (Throwable $e) { continue; /* JSON_TABLE missing on MySQL <8 */ }
      $row = $q->fetch(PDO::FETCH_ASSOC);
      if (!$row || !$row['cat']) continue;
      $cat = $row['cat'];

      // Pick a discounted product from that category as the hook.
      $p = db()->prepare("SELECT slug, name, price, mrp FROM products
                           WHERE category_slug = ? AND in_stock = 1 AND mrp > price
                        ORDER BY (mrp - price) DESC LIMIT 1");
      $p->execute([$cat]);
      $prod = $p->fetch(PDO::FETCH_ASSOC);

      $title = '✨ Picked for you';
      $body  = $prod
        ? ucfirst(str_replace('-', ' ', $cat)) . ' sale: ' . $prod['name'] . ' at ₹' . $prod['price'] . '.'
        : 'Fresh ' . str_replace('-', ' ', $cat) . ' restocked. Tap to explore.';
      $link  = '/c/' . urlencode($cat);
      if (send_promo($uid, 'recommend', $ref, $title, $body, $link)) $report['recommend']++;
    }
  } catch (Throwable $e) { $report['errors'][] = 'recommend: ' . $e->getMessage(); }
}

// =============================================================================
// 5) MEALTIME NUDGES — breakfast / lunch / dinner
// =============================================================================
$meal = null;
if     ($hour >= 7  && $hour < 9)  $meal = ['breakfast', '🌅 Good morning!',  'Start the day right — quick breakfast essentials delivered in minutes.'];
elseif ($hour >= 12 && $hour < 14) $meal = ['lunch',     '🍱 Lunch time',     'Need lunch ingredients? Top picks ready in your area.'];
elseif ($hour >= 19 && $hour < 21) $meal = ['dinner',    '🍽️ Dinner ideas',   'Cooking tonight? Get fresh produce & groceries delivered fast.'];

if ($meal) {
  [$slug, $title, $body] = $meal;
  $ref = 'mealtime:' . $slug . ':' . date('Y-m-d');
  foreach (active_user_ids() as $uid) {
    if (send_promo($uid, 'mealtime', $ref, $title, $body, '/')) $report['mealtime']++;
  }
}

// --- Done --------------------------------------------------------------------
header('Content-Type: application/json');
echo json_encode(['ok' => true, 'sent' => $report, 'at' => date('c')]);
