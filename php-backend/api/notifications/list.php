<?php
require __DIR__ . '/../../notification_helpers.php';
require_method('GET');
$uid = current_user_id();
try {
  ensure_notifications_table();
  if (!notification_table_exists()) json_ok(['items' => [], 'unread' => 0]);

  $cols = notification_select_columns_sql();
  $readCol = notification_read_column_sql();
  $stmt = db()->prepare("SELECT $cols FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
  $stmt->execute([$uid]);
  $rows = array_map(function ($r) {
    $r['is_read'] = (bool)($r['is_read'] ?? false);
    $r['read'] = $r['is_read'];
    if (isset($r['created_at'])) $r['created_at'] = to_iso_utc($r['created_at']);
    return $r;
  }, $stmt->fetchAll());

  $u = db()->prepare("SELECT COUNT(*) c FROM notifications WHERE user_id = ? AND $readCol = 0");
  $u->execute([$uid]);
  json_ok(['items' => $rows, 'unread' => (int)($u->fetch()['c'] ?? 0)]);
} catch (Throwable $e) {
  json_ok(['items' => [], 'unread' => 0]);
}
