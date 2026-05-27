<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$email = trim(strtolower($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');
if (!$email || !$password) json_error('Email and password required');

$stmt = db()->prepare('SELECT id, email, password_hash, full_name, is_blocked FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
  json_error('Invalid email or password', 401);
}
if ((int)$user['is_blocked'] === 1) json_error('Account is blocked', 403);

$token = jwt_sign(['sub' => $user['id'], 'email' => $user['email']]);
json_ok([
  'token' => $token,
  'user'  => [
    'id' => $user['id'],
    'email' => $user['email'],
    'full_name' => $user['full_name'],
  ],
]);
