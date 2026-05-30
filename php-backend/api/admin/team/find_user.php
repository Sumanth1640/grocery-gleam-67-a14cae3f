<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$email = trim((string)(json_body()['email'] ?? ''));
if ($email==='') json_error('Missing email');
$st = db()->prepare('SELECT id, email, full_name, phone, avatar_url, created_at FROM users WHERE email = ? LIMIT 1');
$st->execute([$email]);
json_ok($st->fetch() ?: null);
