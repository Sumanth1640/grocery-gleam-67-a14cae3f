<?php
// ============================================================
// Shared helpers for partner & outlet-manager endpoints
// ============================================================
require_once __DIR__ . '/config.php';

function partner_my_restaurant(string $uid): ?array {
  $s = db()->prepare('SELECT * FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
  $s->execute([$uid]);
  $r = $s->fetch();
  if (!$r) return null;
  $r['cuisines'] = json_decode($r['cuisines'] ?? '[]', true) ?: [];
  $r['is_open'] = (int)$r['is_open'] === 1;
  $r['is_blocked'] = (int)$r['is_blocked'] === 1;
  $r['veg'] = (int)$r['veg'] === 1;
  return $r;
}

function require_partner_restaurant(string $uid): array {
  $r = partner_my_restaurant($uid);
  if (!$r) json_error('Restaurant not found. Create your profile first.', 404);
  return $r;
}

function ensure_owns_restaurant(string $uid, string $restaurant_id): void {
  $s = db()->prepare('SELECT owner_id FROM partner_restaurants WHERE id = ?');
  $s->execute([$restaurant_id]);
  $row = $s->fetch();
  if (!$row) json_error('Restaurant not found', 404);
  if ($row['owner_id'] !== $uid) {
    // allow admins
    $a = db()->prepare("SELECT 1 FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $a->execute([$uid]);
    if (!$a->fetch()) json_error('Not your restaurant', 403);
  }
}

function decode_dish_row(array $d): array {
  $d['price'] = (int)$d['price'];
  $d['mrp'] = isset($d['mrp']) ? (int)$d['mrp'] : null;
  $d['veg'] = (int)$d['veg'] === 1;
  $d['spicy'] = (int)$d['spicy'] === 1;
  $d['bestseller'] = (int)$d['bestseller'] === 1;
  $d['in_stock'] = (int)$d['in_stock'] === 1;
  $d['sort_order'] = (int)$d['sort_order'];
  $d['rating'] = (float)$d['rating'];
  $d['available_days'] = array_map('intval', array_filter(explode(',', $d['available_days'] ?? '0,1,2,3,4,5,6'), 'strlen'));
  return $d;
}

function decode_order_row(array $r): array {
  $r['items']    = json_decode($r['items'] ?? '[]', true) ?: [];
  $r['address']  = json_decode($r['address'] ?? '{}', true) ?: [];
  $r['subtotal'] = (int)$r['subtotal'];
  $r['delivery'] = (int)$r['delivery'];
  $r['total']    = (int)$r['total'];
  return $r;
}

function notify_user(string $user_id, string $kind, string $title, string $body, string $link): void {
  $stmt = db()->prepare('INSERT INTO notifications (id, user_id, kind, title, body, link, created_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW())');
  try { $stmt->execute([uuid_v4(), $user_id, $kind, $title, $body, $link]); } catch (Throwable $e) { /* ignore */ }
}
