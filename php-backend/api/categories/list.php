<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$stmt = db()->query('SELECT id, slug, name, image, tint, sort_order FROM categories ORDER BY sort_order ASC, name ASC');
json_ok($stmt->fetchAll());
