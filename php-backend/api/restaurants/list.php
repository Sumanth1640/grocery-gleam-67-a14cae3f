<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$q = $_GET['q'] ?? null;
$sql = 'SELECT id, slug, name, cuisine, image, rating, eta, price_for_two, is_active
        FROM restaurants WHERE is_active = 1';
$params = [];
if ($q) { $sql .= ' AND name LIKE ?'; $params[] = '%' . $q . '%'; }
$sql .= ' ORDER BY rating DESC, name ASC LIMIT 100';

$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = array_map(function ($r) {
  $r['rating']        = (float)$r['rating'];
  $r['price_for_two'] = (int)$r['price_for_two'];
  $r['is_active']     = (bool)$r['is_active'];
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
