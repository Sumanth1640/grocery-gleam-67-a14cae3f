<?php
// Shared notification helpers. Keeps older PHP/MySQL installs from leaking raw
// SQL/PHP errors into notification badges when a column/table is missing.
require_once __DIR__ . '/config.php';

function notification_table_exists(): bool {
  try {
    $st = db()->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'notifications' LIMIT 1");
    return (bool)$st->fetchColumn();
  } catch (Throwable $e) { return false; }
}

function notification_column_exists(string $column): bool {
  try {
    $st = db()->prepare("SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'notifications' AND column_name = ? LIMIT 1");
    $st->execute([$column]);
    return (bool)$st->fetchColumn();
  } catch (Throwable $e) { return false; }
}

function ensure_notifications_table(): void {
  static $done = false;
  if ($done) return;

  try {
    db()->exec("CREATE TABLE IF NOT EXISTS notifications (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      kind VARCHAR(32) NOT NULL DEFAULT 'system',
      title VARCHAR(255) NOT NULL,
      body TEXT,
      link VARCHAR(512) DEFAULT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_read (user_id, is_read),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
  } catch (Throwable $e) { /* read-only DBs still fall back below */ }

  if (notification_table_exists()) {
    $defs = [
      'kind' => "ALTER TABLE notifications ADD COLUMN kind VARCHAR(32) NOT NULL DEFAULT 'system' AFTER user_id",
      'title' => "ALTER TABLE notifications ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Notification' AFTER kind",
      'body' => "ALTER TABLE notifications ADD COLUMN body TEXT AFTER title",
      'link' => "ALTER TABLE notifications ADD COLUMN link VARCHAR(512) DEFAULT NULL AFTER body",
      'is_read' => "ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER link",
      'created_at' => "ALTER TABLE notifications ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER is_read",
    ];
    foreach ($defs as $col => $sql) {
      if (!notification_column_exists($col)) {
        try { db()->exec($sql); } catch (Throwable $e) { /* ignore */ }
      }
    }
    if (notification_column_exists('is_read') && notification_column_exists('read')) {
      try { db()->exec('UPDATE notifications SET is_read = `read` WHERE is_read = 0 AND `read` = 1'); } catch (Throwable $e) { /* ignore */ }
    }
  }

  $done = true;
}

function notification_read_column_sql(): string {
  ensure_notifications_table();
  if (notification_column_exists('is_read')) return 'is_read';
  if (notification_column_exists('read')) return '`read`';
  return '0';
}

function notification_select_columns_sql(): string {
  ensure_notifications_table();
  $read = notification_read_column_sql();
  return implode(', ', [
    notification_column_exists('id') ? 'id' : "'' AS id",
    notification_column_exists('user_id') ? 'user_id' : "'' AS user_id",
    notification_column_exists('kind') ? 'kind' : "'system' AS kind",
    notification_column_exists('title') ? 'title' : "'Notification' AS title",
    notification_column_exists('body') ? 'body' : 'NULL AS body',
    notification_column_exists('link') ? 'link' : 'NULL AS link',
    "$read AS is_read",
    notification_column_exists('created_at') ? 'created_at' : 'NOW() AS created_at',
  ]);
}

function notify_user(string $user_id, string $kind, string $title, string $body, string $link): void {
  try {
    ensure_notifications_table();
    if (!notification_table_exists()) return;
    $st = db()->prepare('INSERT INTO notifications (id, user_id, kind, title, body, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())');
    $st->execute([uuid_v4(), $user_id, $kind, $title, $body, $link]);
  } catch (Throwable $e) {
    try {
      $st = db()->prepare('INSERT INTO notifications (id, user_id, kind, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
      $st->execute([uuid_v4(), $user_id, $kind, $title, $body, $link]);
    } catch (Throwable $ignored) { /* notification failures must not break checkout */ }
  }
}