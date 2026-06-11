<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();

$id = (string)($_GET['id'] ?? '');
if ($id === '') json_error('Missing id', 400);

try {
  $st = db()->prepare(
    "SELECT r.*, u.id AS user_id, u.email AS owner_email, u.full_name AS owner_name,
            u.phone AS owner_phone, u.avatar_url AS owner_avatar, u.created_at AS owner_created_at
     FROM partner_restaurants r
     LEFT JOIN users u ON u.id = r.owner_id
     WHERE r.id = ? LIMIT 1"
  );
  $st->execute([$id]);
  $partner = $st->fetch();
  if (!$partner) json_error('Partner not found', 404);

  $partner['cuisines']   = json_decode($partner['cuisines'] ?? '[]', true) ?: [];
  $partner['veg']        = (bool)($partner['veg'] ?? 0);
  $partner['is_open']    = (bool)($partner['is_open'] ?? 0);
  $partner['is_blocked'] = (bool)($partner['is_blocked'] ?? 0);
  $partner['commission_rate'] = (float)($partner['commission_rate'] ?? 0);

  $st = db()->prepare("SELECT * FROM partner_outlets WHERE restaurant_id = ? ORDER BY sort_order, created_at");
  $st->execute([$id]);
  $outlets = $st->fetchAll();
  foreach ($outlets as &$o) {
    $o['is_open']   = (bool)$o['is_open'];
    $o['is_active'] = (bool)$o['is_active'];
    $o['eta_mins']  = (int)$o['eta_mins'];
  }

  $stats = ['orders_count' => 0, 'revenue' => 0, 'outlets_count' => count($outlets)];
  try {
    $st = db()->prepare("SELECT COUNT(*) c, COALESCE(SUM(CASE WHEN status NOT IN ('cancelled','refunded') THEN total ELSE 0 END),0) rev FROM orders WHERE restaurant_id = ?");
    $st->execute([$id]);
    $row = $st->fetch();
    $stats['orders_count'] = (int)($row['c'] ?? 0);
    $stats['revenue']      = (int)($row['rev'] ?? 0);
  } catch (Throwable $e) { /* orders may not have restaurant_id */ }

  $recent = [];
  try {
    $st = db()->prepare(
      "SELECT o.id, o.status, o.payment_status, o.total, o.created_at, u.full_name AS customer_name
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       WHERE o.restaurant_id = ? ORDER BY o.created_at DESC LIMIT 15"
    );
    $st->execute([$id]);
    $recent = $st->fetchAll();
    foreach ($recent as &$o) { $o['total'] = (int)$o['total']; }
  } catch (Throwable $e) { /* ignore */ }

  json_ok(['partner' => $partner, 'outlets' => $outlets, 'stats' => $stats, 'recent_orders' => $recent]);
} catch (Throwable $e) {
  json_error('Failed to load partner: ' . $e->getMessage(), 500);
}
