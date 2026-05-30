<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$allowed = ['placed','preparing','ready','out_for_delivery','delivered','cancelled','accepted'];
if (!$id || !in_array($status, $allowed, true)) json_error('Invalid input');
$chk = db()->prepare('SELECT o.id, o.user_id FROM orders o
  JOIN partner_outlet_managers m ON m.outlet_id = o.outlet_id
  WHERE o.id = ? AND m.user_id = ?');
$chk->execute([$id, $uid]);
$o = $chk->fetch();
if (!$o) json_error('Not your order', 403);
db()->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);
notify_user($o['user_id'], 'order', 'Order '.str_replace('_',' ',$status),
  'Your order status was updated to "'.str_replace('_',' ',$status).'".',
  '/orders/'.$id);
json_ok(['ok' => true]);
