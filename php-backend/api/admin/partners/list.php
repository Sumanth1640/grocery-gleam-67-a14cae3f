<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();

$sql = "SELECT r.id AS restaurant_id, r.name AS restaurant_name, r.slug, r.status,
               r.is_blocked, r.is_open, r.commission_rate, r.city, r.area,
               r.created_at AS restaurant_created_at,
               u.id AS user_id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at AS user_created_at,
               (SELECT COUNT(*) FROM partner_outlets po WHERE po.restaurant_id = r.id) AS outlets_count,
               (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) AS orders_count,
               (SELECT COALESCE(SUM(o.total),0) FROM orders o WHERE o.restaurant_id = r.id AND o.status NOT IN ('cancelled','refunded')) AS revenue
        FROM partner_restaurants r
        LEFT JOIN users u ON u.id = r.owner_id
        ORDER BY r.created_at DESC";

try {
  $rows = db()->query($sql)->fetchAll();
} catch (Throwable $e) {
  json_error('Failed to load partners: ' . $e->getMessage(), 500);
}

foreach ($rows as &$r) {
  $r['is_blocked']     = (bool)$r['is_blocked'];
  $r['is_open']        = (bool)$r['is_open'];
  $r['outlets_count']  = (int)$r['outlets_count'];
  $r['orders_count']   = (int)$r['orders_count'];
  $r['revenue']        = (int)$r['revenue'];
  $r['commission_rate']= (float)($r['commission_rate'] ?? 0);
}

json_ok($rows);
