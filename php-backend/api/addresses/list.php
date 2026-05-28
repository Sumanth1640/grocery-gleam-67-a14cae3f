<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();

$stmt = db()->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC');
$stmt->execute([$uid]);
$rows = array_map(function ($r) {
  $r['is_default'] = (bool)$r['is_default'];
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
