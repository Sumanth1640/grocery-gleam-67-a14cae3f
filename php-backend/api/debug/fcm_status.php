<?php
// Diagnostic endpoint: GET /api/debug/fcm_status.php?user_id=<rider_uuid>&send=1
// Tells you exactly why FCM is or isn't working. Safe to leave deployed
// (read-only; only sends a test push if you pass send=1 AND a user_id).

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../fcm_send.php';

header('Content-Type: application/json');

$out = [
  'php_version' => PHP_VERSION,
  'curl_loaded' => extension_loaded('curl'),
  'openssl_loaded' => extension_loaded('openssl'),
  'service_account_path' => defined('FCM_SERVICE_ACCOUNT_PATH') ? FCM_SERVICE_ACCOUNT_PATH : null,
  'service_account_readable' => false,
  'project_id' => null,
  'client_email' => null,
  'access_token_ok' => false,
  'access_token_error' => null,
  'device_tokens_table_exists' => false,
  'tokens_for_user' => 0,
  'send_test' => null,
];

$path = defined('FCM_SERVICE_ACCOUNT_PATH') ? FCM_SERVICE_ACCOUNT_PATH : '';
if ($path && is_readable($path)) {
  $out['service_account_readable'] = true;
  $sa = json_decode((string)file_get_contents($path), true);
  $out['project_id']   = $sa['project_id']   ?? null;
  $out['client_email'] = $sa['client_email'] ?? null;
}

// Try to mint an access token (captures real Google error response)
try {
  $sa = $out['service_account_readable'] ? json_decode((string)file_get_contents($path), true) : null;
  if ($sa && !empty($sa['client_email']) && !empty($sa['private_key'])) {
    $now = time();
    $b64 = fn($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    $unsigned = $b64(json_encode(['alg'=>'RS256','typ'=>'JWT'])) . '.' .
      $b64(json_encode([
        'iss'=>$sa['client_email'],
        'scope'=>'https://www.googleapis.com/auth/firebase.messaging',
        'aud'=>'https://oauth2.googleapis.com/token',
        'iat'=>$now,'exp'=>$now+3600,
      ]));
    $pk = openssl_pkey_get_private($sa['private_key']);
    if (!$pk) { $out['access_token_error'] = 'openssl_pkey_get_private failed (bad private_key)'; }
    else {
      $sig=''; openssl_sign($unsigned, $sig, $pk, 'SHA256');
      $jwt = $unsigned . '.' . $b64($sig);
      $ch = curl_init('https://oauth2.googleapis.com/token');
      curl_setopt_array($ch, [
        CURLOPT_POST=>true,
        CURLOPT_POSTFIELDS=>http_build_query([
          'grant_type'=>'urn:ietf:params:oauth:grant-type:jwt-bearer',
          'assertion'=>$jwt,
        ]),
        CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>15,
      ]);
      $resp = curl_exec($ch);
      $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      if ($code === 200) { $out['access_token_ok'] = true; }
      else { $out['access_token_error'] = "http $code: $resp"; }
    }
  } else {
    $out['access_token_error'] = 'service account JSON missing or incomplete';
  }
} catch (Throwable $e) {
  $out['access_token_error'] = $e->getMessage();
}

// Check device_tokens table + per-user count
try {
  $r = db()->query("SHOW TABLES LIKE 'device_tokens'")->fetchAll();
  $out['device_tokens_table_exists'] = !empty($r);
  $uid = $_GET['user_id'] ?? '';
  if ($uid && $out['device_tokens_table_exists']) {
    $st = db()->prepare('SELECT token, platform, updated_at FROM device_tokens WHERE user_id = ?');
    $st->execute([$uid]);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
    $out['tokens_for_user'] = count($rows);
    $out['tokens_preview'] = array_map(fn($r) => [
      'platform' => $r['platform'],
      'updated_at' => $r['updated_at'],
      'token_prefix' => substr($r['token'], 0, 20) . '...',
    ], $rows);
  }
} catch (Throwable $e) {
  $out['db_error'] = $e->getMessage();
}

// Optional: actually send a test notification
if (!empty($_GET['send']) && !empty($_GET['user_id'])) {
  try {
    fcm_send_to_user($_GET['user_id'], 'Test notification', 'If you see this, FCM is working ✅', ['route' => '/']);
    $out['send_test'] = 'fcm_send_to_user called (check device + server error log for FCM send http NNN lines)';
  } catch (Throwable $e) {
    $out['send_test'] = 'exception: ' . $e->getMessage();
  }
}

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
