<?php
// Public list of customer-facing restaurants — partner restaurants that have
// been approved by admin, signed the agreement, and are not blocked.
require __DIR__ . '/../../config.php';
require_method('GET');

$q = $_GET['q'] ?? null;
$sql = "SELECT id, slug, name, cuisines, image, cover, rating, reviews_count,
               eta_mins, cost_for_two, area, price_tier, distance_km, veg, offer,
               is_open, opens_at, closes_at, status
        FROM partner_restaurants
        WHERE status = 'approved'
          AND is_blocked = 0
          AND agreement_accepted_at IS NOT NULL";
$params = [];
if ($q) { $sql .= ' AND name LIKE ?'; $params[] = '%' . $q . '%'; }
$sql .= ' ORDER BY rating DESC, name ASC LIMIT 200';

$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = array_map(function ($r) {
  $r['cuisines']      = json_decode($r['cuisines'] ?? '[]', true) ?: [];
  $r['rating']        = (float)$r['rating'];
  $r['reviews_count'] = (int)$r['reviews_count'];
  $r['eta_mins']      = (int)$r['eta_mins'];
  $r['cost_for_two']  = (int)$r['cost_for_two'];
  $r['price_tier']    = (int)$r['price_tier'];
  $r['distance_km']   = (float)$r['distance_km'];
  $r['veg']           = (int)$r['veg'] === 1;
  $r['is_open']       = (int)$r['is_open'] === 1;
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
