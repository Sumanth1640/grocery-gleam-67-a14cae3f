<?php
require __DIR__ . '/../../notification_helpers.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null;
if (!$id) json_error('id required');
try {
  ensure_notifications_table();
  if (!notification_table_exists()) json_ok(['deleted' => 0]);
  $stmt = db()->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
  $stmt->execute([$id, $uid]);
  json_ok(['deleted' => $stmt->rowCount()]);
} catch (Throwable $e) {
  json_ok(['deleted' => 0]);
}
