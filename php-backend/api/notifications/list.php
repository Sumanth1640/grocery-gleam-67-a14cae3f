<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();
$stmt = db()->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
$stmt->execute([$uid]);
$rows = array_map(function ($r) {
  $r['is_read'] = (bool)$r['is_read'];
  return $r;
}, $stmt->fetchAll());

$u = db()->prepare('SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND is_read = 0');
$u->execute([$uid]);
json_ok(['items' => $rows, 'unread' => (int)$u->fetch()['c']]);
