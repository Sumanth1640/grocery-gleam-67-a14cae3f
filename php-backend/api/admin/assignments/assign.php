<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$rider_id = (string)($b['rider_id'] ?? '');
if ($order_id==='' || $rider_id==='') json_error('Missing fields');
$id = uuid_v4();
db()->prepare('INSERT INTO order_assignments (id,order_id,rider_id,status,notes) VALUES (?,?,?,?,?)
               ON DUPLICATE KEY UPDATE rider_id=VALUES(rider_id), status=\'assigned\', updated_at=CURRENT_TIMESTAMP')
   ->execute([$id,$order_id,$rider_id,'assigned','']);
json_ok(['ok'=>true]);
