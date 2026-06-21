<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$wanted = (string)($b['warehouse_id'] ?? '');

$m = db()->prepare('SELECT warehouse_id FROM warehouse_managers WHERE user_id = ?');
$m->execute([$uid]);
$ids = array_column($m->fetchAll(), 'warehouse_id');
if ($wanted) {
  if (!in_array($wanted, $ids, true)) json_error('Not your warehouse', 403);
  $ids = [$wanted];
}
if (!$ids) json_ok([]);

$in = implode(',', array_fill(0, count($ids), '?'));
$o = db()->prepare("SELECT * FROM orders WHERE warehouse_id IN ($in) ORDER BY created_at DESC LIMIT 100");
$o->execute($ids);
$rows = array_map('decode_order_row', $o->fetchAll());
foreach ($rows as &$r) {
  if (isset($r['created_at'])) $r['created_at'] = to_iso_utc($r['created_at']);
}
json_ok($rows);
