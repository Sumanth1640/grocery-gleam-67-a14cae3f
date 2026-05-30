<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in = json_body();
$id = $in['id'] ?? null;
if (!$id) json_error('id required');

$db = db();
$db->beginTransaction();
try {
  $u = $db->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?');
  $u->execute([$uid]);
  $s = $db->prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?');
  $s->execute([$id, $uid]);
  $db->commit();
  json_ok(['updated' => $s->rowCount()]);
} catch (Throwable $e) {
  $db->rollBack();
  json_error('Failed: ' . $e->getMessage(), 500);
}
