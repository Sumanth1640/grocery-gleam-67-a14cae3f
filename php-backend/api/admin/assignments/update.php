<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$allowed = ['assigned','picked_up','delivered','cancelled'];
if ($id==='' || !in_array($status,$allowed,true)) json_error('Invalid input');
$extra = '';
if ($status==='picked_up')  $extra = ', picked_up_at = CURRENT_TIMESTAMP';
if ($status==='delivered')  $extra = ', delivered_at = CURRENT_TIMESTAMP';
db()->prepare("UPDATE order_assignments SET status=? $extra WHERE id=?")->execute([$status,$id]);
if ($status==='delivered') {
  db()->prepare("UPDATE orders o JOIN order_assignments a ON a.order_id=o.id SET o.status='delivered' WHERE a.id=?")->execute([$id]);
}
json_ok(['ok'=>true]);
