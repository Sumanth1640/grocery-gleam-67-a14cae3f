<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$wanted = (string)($b['outlet_id'] ?? '');
$m = db()->prepare('SELECT outlet_id FROM partner_outlet_managers WHERE user_id = ?');
$m->execute([$uid]);
$ids = array_column($m->fetchAll(), 'outlet_id');
if ($wanted) {
  if (!in_array($wanted, $ids, true)) json_error('Not your outlet', 403);
  $ids = [$wanted];
}
if (!$ids) json_ok([]);
$in = implode(',', array_fill(0, count($ids), '?'));
$o = db()->prepare("SELECT * FROM orders WHERE outlet_id IN ($in) ORDER BY created_at DESC LIMIT 100");
$o->execute($ids);
$rows = array_map('decode_order_row', $o->fetchAll());
foreach ($rows as &$r) {
  if (isset($r['created_at'])) $r['created_at'] = to_iso_utc($r['created_at']);
}
json_ok($rows);
