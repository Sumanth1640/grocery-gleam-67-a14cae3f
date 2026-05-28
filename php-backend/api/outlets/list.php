<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$pincode = $_GET['pincode'] ?? null;
$sql = 'SELECT id, name, address, city, pincode, phone, lat, lng FROM outlets WHERE is_active = 1';
$params = [];
if ($pincode) { $sql .= ' AND pincode = ?'; $params[] = $pincode; }
$sql .= ' ORDER BY name ASC LIMIT 100';
$stmt = db()->prepare($sql);
$stmt->execute($params);
$rows = array_map(function ($r) {
  $r['lat'] = $r['lat'] !== null ? (float)$r['lat'] : null;
  $r['lng'] = $r['lng'] !== null ? (float)$r['lng'] : null;
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
