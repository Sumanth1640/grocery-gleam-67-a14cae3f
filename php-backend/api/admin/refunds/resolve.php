<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$note = (string)($b['admin_note'] ?? '');
if ($id==='' || !in_array($status, ['approved','rejected','refunded','pending'], true)) json_error('Invalid input');
db()->prepare('UPDATE refund_requests SET status=?, admin_note=? WHERE id=?')->execute([$status,$note,$id]);
json_ok(['ok'=>true]);
