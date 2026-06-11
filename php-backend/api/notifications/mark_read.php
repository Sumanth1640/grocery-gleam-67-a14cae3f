<?php
require __DIR__ . '/../../notification_helpers.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null; // null = mark all
try {
  ensure_notifications_table();
  if (!notification_table_exists()) json_ok(['updated' => 0]);
  $readCol = notification_read_column_sql();
  if ($readCol === '0') json_ok(['updated' => 0]);
  if ($id) {
    $stmt = db()->prepare("UPDATE notifications SET $readCol = 1 WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $uid]);
  } else {
    $stmt = db()->prepare("UPDATE notifications SET $readCol = 1 WHERE user_id = ?");
    $stmt->execute([$uid]);
  }
  json_ok(['updated' => $stmt->rowCount()]);
} catch (Throwable $e) {
  json_ok(['updated' => 0]);
}
