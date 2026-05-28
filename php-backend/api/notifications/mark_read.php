<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null; // null = mark all
if ($id) {
  $stmt = db()->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
  $stmt->execute([$id, $uid]);
} else {
  $stmt = db()->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
  $stmt->execute([$uid]);
}
json_ok(['updated' => $stmt->rowCount()]);
