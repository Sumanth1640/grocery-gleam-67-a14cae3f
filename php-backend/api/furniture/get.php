<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
$slug = isset($_GET['slug']) ? trim((string)$_GET['slug']) : '';
if ($slug === '') json_error('Missing slug');
$st = db()->prepare('SELECT * FROM furniture_items WHERE slug=? AND is_active=1');
$st->execute([$slug]);
$row = $st->fetch();
if ($row) {
  $row['price'] = (float)$row['price'];
  $row['mrp'] = (float)$row['mrp'];
  $row['is_active'] = (bool)$row['is_active'];
  $row['sort_order'] = (int)$row['sort_order'];
}
json_ok($row ?: null);
