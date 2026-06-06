<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$b = json_body();
$name  = trim((string)($b['name']  ?? ''));
$email = trim((string)($b['email'] ?? ''));
$phone = trim((string)($b['phone'] ?? ''));
$city  = trim((string)($b['city']  ?? ''));
$pin   = trim((string)($b['pincode'] ?? ''));
$msg   = trim((string)($b['message'] ?? ''));
$items = $b['items'] ?? [];
$total = (float)($b['total'] ?? 0);
if ($name === '' || $email === '' || !is_array($items) || count($items) === 0) {
  json_error('Name, email and at least one item are required');
}
$uid = null;
try {
  $hdr = trim($_SERVER['HTTP_AUTHORIZATION'] ?? '');
  if (str_starts_with($hdr, 'Bearer ')) {
    $payload = jwt_verify(substr($hdr, 7));
    if ($payload && !empty($payload['sub'])) $uid = $payload['sub'];
  }
} catch (Throwable $e) { /* anonymous quote OK */ }
$id = uuid_v4();
$st = db()->prepare('INSERT INTO furniture_quotes (id,user_id,name,email,phone,city,pincode,message,items,total) VALUES (?,?,?,?,?,?,?,?,?,?)');
$st->execute([$id, $uid, $name, $email, $phone, $city, $pin, $msg, json_encode($items), $total]);
json_ok(['id' => $id]);
