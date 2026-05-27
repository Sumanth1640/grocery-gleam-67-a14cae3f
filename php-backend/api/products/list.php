<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$category = $_GET['category'] ?? null;
$q        = $_GET['q'] ?? null;

$sql = 'SELECT * FROM products WHERE 1=1';
$params = [];
if ($category) { $sql .= ' AND category_slug = ?'; $params[] = $category; }
if ($q)        { $sql .= ' AND name LIKE ?';      $params[] = '%' . $q . '%'; }
$sql .= ' ORDER BY created_at ASC LIMIT 200';

$stmt = db()->prepare($sql);
$stmt->execute($params);
// Cast numeric columns for JSON
$rows = array_map(function ($r) {
  $r['price']    = (int)$r['price'];
  $r['mrp']      = (int)$r['mrp'];
  $r['rating']   = (float)$r['rating'];
  $r['in_stock'] = (bool)$r['in_stock'];
  return $r;
}, $stmt->fetchAll());

json_ok($rows);
