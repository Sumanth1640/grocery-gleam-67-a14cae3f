<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('POST');
$rider = require_rider();
$b = json_body();
$aid = (string)($b['assignment_id'] ?? '');
$status = (string)($b['status'] ?? '');
if ($aid === '' || !in_array($status, ['picked_up','delivered','assigned'], true)) json_error('Invalid input');

$st = db()->prepare('SELECT id, order_id, rider_id FROM order_assignments WHERE id = ?');
$st->execute([$aid]);
$a = $st->fetch();
if (!$a || $a['rider_id'] !== $rider['id']) json_error('Assignment not found', 404);

$extra = '';
if ($status === 'picked_up') $extra = ', picked_up_at = CURRENT_TIMESTAMP';
if ($status === 'delivered') $extra = ', delivered_at = CURRENT_TIMESTAMP';
db()->prepare("UPDATE order_assignments SET status = ? $extra WHERE id = ?")->execute([$status, $aid]);

if ($status === 'picked_up') {
  db()->prepare("UPDATE orders SET status = 'out_for_delivery' WHERE id = ?")->execute([$a['order_id']]);
} elseif ($status === 'delivered') {
  db()->prepare("UPDATE orders SET status = 'delivered' WHERE id = ?")->execute([$a['order_id']]);
  // Trigger replacement: record the earning row (idempotent)
  record_rider_earning($rider['id'], $a['order_id']);
}
json_ok(['ok' => true]);
