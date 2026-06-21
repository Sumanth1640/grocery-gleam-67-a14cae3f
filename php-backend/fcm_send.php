<?php
// php-backend/fcm_send.php
// Sends FCM push notifications using Firebase HTTP v1 + a service account.
//
// SETUP (do once on Hostinger):
//   1. Generate a Firebase service account private key from the Firebase Console.
//   2. Upload the JSON file to a folder OUTSIDE public_html (e.g.
//      /home/<youruser>/private/fcm-service-account.json).
//   3. In your Hostinger control panel set an environment variable:
//        FCM_SERVICE_ACCOUNT_PATH = /home/<youruser>/private/fcm-service-account.json
//   4. NEVER commit the JSON file to git.

require_once __DIR__ . '/config.php';

if (!defined('FCM_SERVICE_ACCOUNT_PATH')) {
  $envPath = getenv('FCM_SERVICE_ACCOUNT_PATH');
  if (!$envPath || !is_string($envPath) || $envPath === '') {
    // fallback to the local secrets folder (gitignored, never commit)
    $fallback = __DIR__ . '/secrets/fcm-service-account.json';
    if (is_readable($fallback)) {
      $envPath = $fallback;
    } else {
      foreach (glob(__DIR__ . '/secrets/*.json') ?: [] as $candidate) {
        $json = json_decode((string)@file_get_contents($candidate), true);
        if (!empty($json['project_id']) && !empty($json['client_email']) && !empty($json['private_key'])) {
          $envPath = $candidate;
          break;
        }
      }
      if (!$envPath) {
        error_log('FCM: FCM_SERVICE_ACCOUNT_PATH env var is not set and no Firebase service-account JSON was found in secrets/');
      }
    }
  }
  define('FCM_SERVICE_ACCOUNT_PATH', $envPath ?: '');
}

function fcm_access_token(): ?string {
  static $cached = null; static $exp = 0;
  if ($cached && time() < $exp - 60) return $cached;

  $path = FCM_SERVICE_ACCOUNT_PATH;
  if (!is_readable($path)) { error_log("FCM: service account not readable at $path"); return null; }
  $sa = json_decode(file_get_contents($path), true);
  if (!$sa || empty($sa['client_email']) || empty($sa['private_key'])) return null;

  $now = time();
  $header  = ['alg' => 'RS256', 'typ' => 'JWT'];
  $claims  = [
    'iss'   => $sa['client_email'],
    'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
    'aud'   => 'https://oauth2.googleapis.com/token',
    'iat'   => $now,
    'exp'   => $now + 3600,
  ];
  $b64 = fn($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
  $unsigned = $b64(json_encode($header)) . '.' . $b64(json_encode($claims));

  $sig = '';
  $pk = openssl_pkey_get_private($sa['private_key']);
  if (!$pk) { error_log('FCM: bad private key'); return null; }
  openssl_sign($unsigned, $sig, $pk, 'SHA256');
  $jwt = $unsigned . '.' . $b64($sig);

  $ch = curl_init('https://oauth2.googleapis.com/token');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
      'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      'assertion'  => $jwt,
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
  ]);
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($code !== 200) { error_log("FCM token http $code: $resp"); return null; }
  $j = json_decode($resp, true);
  if (empty($j['access_token'])) return null;

  $cached = $j['access_token'];
  $exp    = $now + (int)($j['expires_in'] ?? 3600);
  return $cached;
}

function fcm_project_id(): ?string {
  if (!is_readable(FCM_SERVICE_ACCOUNT_PATH)) return null;
  $sa = json_decode(file_get_contents(FCM_SERVICE_ACCOUNT_PATH), true);
  return $sa['project_id'] ?? null;
}

/**
 * Send a notification to every device token registered for $user_id.
 * Silently no-ops if FCM isn't configured. Never throws.
 */
function fcm_send_to_user(string $user_id, string $title, string $body, array $data = []): void {
  try {
    $token = fcm_access_token();
    $project = fcm_project_id();
    if (!$token || !$project) return;

    try {
      db()->exec("CREATE TABLE IF NOT EXISTS device_tokens (
        token VARCHAR(512) PRIMARY KEY,
        user_id CHAR(36) DEFAULT NULL,
        platform VARCHAR(16) NOT NULL DEFAULT 'android',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Throwable $e) {}

    $st = db()->prepare('SELECT token FROM device_tokens WHERE user_id = ?');
    $st->execute([$user_id]);
    $tokens = array_column($st->fetchAll(), 'token');
    if (!$tokens) return;

    $url = "https://fcm.googleapis.com/v1/projects/$project/messages:send";
    foreach ($tokens as $t) {
      $payload = [
        'message' => [
          'token' => $t,
          'notification' => ['title' => $title, 'body' => $body],
          'data' => array_map('strval', array_merge(['title' => $title, 'body' => $body], $data)),
          'android' => [
            'priority' => 'HIGH',
            'ttl' => '86400s',
            'notification' => [
              'channel_id' => 'hallifresh-default',
              'notification_priority' => 'PRIORITY_HIGH',
              'icon' => 'ic_stat_hallifresh',
              'default_sound' => true,
              'default_vibrate_timings' => true,
            ],
          ],
        ],
      ];
      $ch = curl_init($url);
      curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
          'Authorization: Bearer ' . $token,
          'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
      ]);
      $resp = curl_exec($ch);
      $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      // 404 / 410 = token is no longer valid -> prune
      if ($code === 404 || $code === 410) {
        try { db()->prepare('DELETE FROM device_tokens WHERE token = ?')->execute([$t]); } catch (Throwable $e) {}
      } elseif ($code >= 400) {
        error_log("FCM send http $code: $resp");
      }
    }
  } catch (Throwable $e) {
    error_log('FCM send failed: ' . $e->getMessage());
  }
}
