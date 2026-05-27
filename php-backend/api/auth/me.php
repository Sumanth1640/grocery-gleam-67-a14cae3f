<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$uid = current_user_id();
$stmt = db()->prepare('SELECT id, email, full_name, phone, avatar_url, created_at FROM users WHERE id = ?');
$stmt->execute([$uid]);
$user = $stmt->fetch();
if (!$user) json_error('User not found', 404);
json_ok($user);
