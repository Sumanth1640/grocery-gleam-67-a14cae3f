<?php
// php-backend/api/notifications/register_token.php
// Stores an FCM (or APNs) device token for the authenticated user so the
// server can deliver push notifications. Safe to call repeatedly — tokens
// are upserted by (token).
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_decode(file_get_contents('php://input'), true) ?: [];
$token    = trim((string)($in['token']    ?? ''));
$platform = trim((string)($in['platform'] ?? 'android'));
if ($token === '') json_error('token required', 400);

// Authenticated user is optional — if not signed in we still keep the token
// so a later login can attach it.
$uid = null;
try {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (empty($hdr) && function_exists('getallheaders')) {
    $all = getallheaders();
    $hdr = $all['Authorization'] ?? $all['authorization'] ?? '';
  }
  if (str_starts_with($hdr, 'Bearer ')) {
    $payload = jwt_verify(substr($hdr, 7));
    if ($payload && !empty($payload['sub'])) $uid = (string)$payload['sub'];
  }
} catch (Throwable $e) { /* ignore */ }

try {
  db()->exec("CREATE TABLE IF NOT EXISTS device_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id CHAR(36) DEFAULT NULL,
    platform VARCHAR(16) NOT NULL DEFAULT 'android',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $st = db()->prepare(
    "INSERT INTO device_tokens (token, user_id, platform)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), platform = VALUES(platform), updated_at = NOW()"
  );
  $st->execute([$token, $uid, $platform]);
  json_ok(['ok' => true]);
} catch (Throwable $e) {
  json_error('Failed to store token', 500);
}
