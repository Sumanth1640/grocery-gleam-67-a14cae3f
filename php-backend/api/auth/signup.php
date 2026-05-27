<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$email = trim(strtolower($in['email'] ?? ''));
$password = (string)($in['password'] ?? '');
$fullName = trim($in['full_name'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email');
if (strlen($password) < 8) json_error('Password must be at least 8 characters');

$pdo = db();
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) json_error('Email already registered', 409);

$id = uuid_v4();
$hash = password_hash($password, PASSWORD_BCRYPT);
$pdo->prepare('INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)')
    ->execute([$id, $email, $hash, $fullName ?: null]);

$token = jwt_sign(['sub' => $id, 'email' => $email]);
json_ok([
  'token' => $token,
  'user'  => ['id' => $id, 'email' => $email, 'full_name' => $fullName],
]);
