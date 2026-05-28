<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null;
if (!$id) json_error('id required');

$stmt = db()->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $uid]);
json_ok(['deleted' => $stmt->rowCount()]);
