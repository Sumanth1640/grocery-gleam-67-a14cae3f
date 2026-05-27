<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$slug = $_GET['slug'] ?? '';
if (!$slug) json_error('slug required');

$stmt = db()->prepare('SELECT * FROM products WHERE slug = ?');
$stmt->execute([$slug]);
$row = $stmt->fetch();
if (!$row) json_error('Not found', 404);

$row['price']    = (int)$row['price'];
$row['mrp']      = (int)$row['mrp'];
$row['rating']   = (float)$row['rating'];
$row['in_stock'] = (bool)$row['in_stock'];

json_ok($row);
