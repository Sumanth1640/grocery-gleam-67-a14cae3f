<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$wid = (string)(json_body()['warehouse_id'] ?? '');
if ($wid === '') json_error('Missing warehouse_id');
// NOTE: no `profiles` table on the PHP/MySQL backend — use users.full_name directly.
$sql = 'SELECT m.id, m.user_id, m.created_at, u.email, u.full_name
        FROM warehouse_managers m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.warehouse_id = ?
        ORDER BY m.created_at DESC';
$st = db()->prepare($sql);
$st->execute([$wid]);
json_ok($st->fetchAll());
