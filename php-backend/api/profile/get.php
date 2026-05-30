<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();
$stmt = db()->prepare('SELECT id, email, full_name, phone, avatar_url FROM users WHERE id = ?');
$stmt->execute([$uid]);
$r = $stmt->fetch();
if (!$r) json_error('Not found', 404);
json_ok($r);
