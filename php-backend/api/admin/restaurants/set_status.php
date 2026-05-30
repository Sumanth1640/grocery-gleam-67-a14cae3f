<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$reason = (string)($b['rejection_reason'] ?? '');
if ($id==='' || !in_array($status, ['pending','approved','rejected'], true)) json_error('Invalid input');
db()->prepare('UPDATE partner_restaurants SET status=?, rejection_reason=? WHERE id=?')->execute([$status,$reason,$id]);
json_ok(['ok'=>true]);
