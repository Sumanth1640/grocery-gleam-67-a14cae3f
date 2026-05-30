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

if (!function_exists('str_starts_with')) {
  function str_starts_with(string $haystack, string $needle): bool {
    return $needle === '' || strncmp($haystack, $needle, strlen($needle)) === 0;
  }
}

function current_user_id(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (empty($hdr) && function_exists('getallheaders')) {
    $all = getallheaders();
    $hdr = $all['Authorization'] ?? $all['authorization'] ?? '';
  }
  if (!str_starts_with($hdr, 'Bearer ')) json_error('Unauthorized', 401);
  $token = substr($hdr, 7);
  $payload = jwt_verify($token);
  if (!$payload || empty($payload['sub'])) json_error('Unauthorized', 401);
  return $payload['sub'];
}

// ============================================================
// Role / ownership helpers (mirrors Supabase has_role/owns_*)
// ============================================================
function has_role(string $user_id, string $role): bool {
  $st = db()->prepare('SELECT 1 FROM user_roles WHERE user_id = ? AND role = ? LIMIT 1');
  $st->execute([$user_id, $role]);
  return (bool)$st->fetchColumn();
}

function require_admin(?string $user_id = null): string {
  $uid = $user_id ?? current_user_id();
  if (!has_role($uid, 'admin')) json_error('Admin role required', 403);
  return $uid;
}

function manages_warehouse(string $user_id, string $warehouse_id): bool {
  $st = db()->prepare('SELECT 1 FROM warehouse_managers WHERE user_id = ? AND warehouse_id = ? LIMIT 1');
  $st->execute([$user_id, $warehouse_id]);
  return (bool)$st->fetchColumn();
}

function my_warehouse_ids(string $user_id): array {
  $st = db()->prepare('SELECT warehouse_id FROM warehouse_managers WHERE user_id = ?');
  $st->execute([$user_id]);
  return $st->fetchAll(PDO::FETCH_COLUMN) ?: [];
}

/** Returns [bool is_admin, string[] warehouse_ids]. Throws 403 if neither. */
function require_admin_or_warehouse_manager(?string $user_id = null): array {
  $uid = $user_id ?? current_user_id();
  $is_admin = has_role($uid, 'admin');
  $wh = $is_admin ? [] : my_warehouse_ids($uid);
  if (!$is_admin && empty($wh)) json_error('Admin or warehouse-manager role required', 403);
  return [$is_admin, $wh, $uid];
}

function owns_restaurant(string $user_id, string $restaurant_id): bool {
  $st = db()->prepare('SELECT 1 FROM partner_restaurants WHERE id = ? AND owner_id = ? LIMIT 1');
  $st->execute([$restaurant_id, $user_id]);
  return (bool)$st->fetchColumn();
}

function my_restaurant_id(string $user_id): ?string {
  $st = db()->prepare('SELECT id FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
  $st->execute([$user_id]);
  $r = $st->fetchColumn();
  return $r ?: null;
}

function manages_outlet(string $user_id, string $outlet_id): bool {
  $st = db()->prepare('SELECT 1 FROM partner_outlet_managers WHERE user_id = ? AND outlet_id = ? LIMIT 1');
  $st->execute([$user_id, $outlet_id]);
  return (bool)$st->fetchColumn();
}

function my_outlet_ids(string $user_id): array {
  $st = db()->prepare('SELECT outlet_id FROM partner_outlet_managers WHERE user_id = ?');
  $st->execute([$user_id]);
  return $st->fetchAll(PDO::FETCH_COLUMN) ?: [];
}
