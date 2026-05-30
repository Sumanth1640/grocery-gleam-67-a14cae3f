<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in = json_input();
$full_name = isset($in['full_name']) ? trim((string)$in['full_name']) : null;
$phone     = isset($in['phone']) ? trim((string)$in['phone']) : null;

$stmt = db()->prepare('UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?');
$stmt->execute([$full_name, $phone, $uid]);
json_ok(['updated' => $stmt->rowCount()]);
