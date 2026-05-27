<?php
// ============================================================
// config.php — DB connection + shared helpers (CORS, JSON, JWT)
// ============================================================

// ---------- EDIT THESE FOR YOUR ENVIRONMENT ----------
define('DB_HOST', 'localhost');
define('DB_NAME', 'grocery_app');
define('DB_USER', 'root');
define('DB_PASS', '');
define('JWT_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_64_CHARS_MINIMUM');
define('JWT_TTL_SECONDS', 60 * 60 * 24 * 7); // 7 days
// -----------------------------------------------------

// CORS — allow your React frontend domain
header('Access-Control-Allow-Origin: *'); // tighten this in production
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ---------- DB ----------
function db(): PDO {
  static $pdo = null;
  if ($pdo === null) {
    $pdo = new PDO(
      'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
      DB_USER, DB_PASS,
      [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]
    );
  }
  return $pdo;
}

// ---------- JSON helpers ----------
function json_body(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function json_ok($data, int $status = 200): void {
  http_response_code($status);
  echo json_encode($data);
  exit;
}

function json_error(string $message, int $status = 400): void {
  http_response_code($status);
  echo json_encode(['error' => $message]);
  exit;
}

function require_method(string $method): void {
  if ($_SERVER['REQUEST_METHOD'] !== $method) {
    json_error("Method not allowed", 405);
  }
}

// ---------- UUID v4 ----------
function uuid_v4(): string {
  $data = random_bytes(16);
  $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
  $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// ---------- JWT (HS256) — minimal implementation ----------
function b64url_encode(string $s): string {
  return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
}
function b64url_decode(string $s): string {
  return base64_decode(strtr($s, '-_', '+/'));
}

function jwt_sign(array $payload): string {
  $header = ['alg' => 'HS256', 'typ' => 'JWT'];
  $payload['iat'] = time();
  $payload['exp'] = time() + JWT_TTL_SECONDS;
  $h = b64url_encode(json_encode($header));
  $p = b64url_encode(json_encode($payload));
  $sig = hash_hmac('sha256', "$h.$p", JWT_SECRET, true);
  return "$h.$p." . b64url_encode($sig);
}

function jwt_verify(string $token): ?array {
  $parts = explode('.', $token);
  if (count($parts) !== 3) return null;
  [$h, $p, $s] = $parts;
  $expected = b64url_encode(hash_hmac('sha256', "$h.$p", JWT_SECRET, true));
  if (!hash_equals($expected, $s)) return null;
  $payload = json_decode(b64url_decode($p), true);
  if (!is_array($payload)) return null;
  if (isset($payload['exp']) && $payload['exp'] < time()) return null;
  return $payload;
}

function current_user_id(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!str_starts_with($hdr, 'Bearer ')) json_error('Unauthorized', 401);
  $token = substr($hdr, 7);
  $payload = jwt_verify($token);
  if (!$payload || empty($payload['sub'])) json_error('Unauthorized', 401);
  return $payload['sub'];
}
