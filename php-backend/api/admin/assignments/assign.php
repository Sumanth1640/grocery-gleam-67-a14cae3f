<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin_or_warehouse_manager();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$rider_id = (string)($b['rider_id'] ?? '');
if ($order_id==='' || $rider_id==='') json_error('Missing fields');
$id = uuid_v4();
db()->prepare('INSERT INTO order_assignments (id,order_id,rider_id,status,notes) VALUES (?,?,?,?,?)
               ON DUPLICATE KEY UPDATE rider_id=VALUES(rider_id), status=\'assigned\', updated_at=CURRENT_TIMESTAMP')
   ->execute([$id,$order_id,$rider_id,'assigned','']);

// Notify the rider (if linked to a user account)
$trace = __DIR__ . '/../../../secrets/assign_trace.log';
$st = db()->prepare('SELECT user_id FROM riders WHERE id = ?');
$st->execute([$rider_id]); $ru = $st->fetchColumn();
@file_put_contents($trace, '['.date('c')."] [admin] assign order=$order_id rider=$rider_id rider_user_id=".($ru?:'(null)')."\n", FILE_APPEND);
if ($ru) {
  require_once __DIR__ . '/../../../notification_helpers.php';
  try {
    $c = db()->prepare('SELECT COUNT(*) FROM device_tokens WHERE user_id = ?');
    $c->execute([$ru]); $n = (int)$c->fetchColumn();
    @file_put_contents($trace, '['.date('c')."] [admin] device_tokens for $ru = $n\n", FILE_APPEND);
  } catch (Throwable $e) {
    @file_put_contents($trace, '['.date('c')."] [admin] device_tokens lookup err: ".$e->getMessage()."\n", FILE_APPEND);
  }
  notify_user($ru, 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider');
  @file_put_contents($trace, '['.date('c')."] [admin] notify_user returned\n", FILE_APPEND);
} else {
  @file_put_contents($trace, '['.date('c')."] [admin] SKIP: rider has no user_id\n", FILE_APPEND);
}

json_ok(['ok'=>true]);
