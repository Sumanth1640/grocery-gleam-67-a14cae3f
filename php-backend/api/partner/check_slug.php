<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$body = json_body();
$slug = trim((string)($body['slug'] ?? ''));
if ($slug === '' || !preg_match('/^[a-z0-9-]{2,60}$/', $slug)) json_error('Invalid slug');
$s = db()->prepare('SELECT id, owner_id FROM partner_restaurants WHERE slug = ? LIMIT 1');
$s->execute([$slug]);
$row = $s->fetch();
if (!$row) json_ok(['available' => true]);
json_ok(['available' => $row['owner_id'] === $uid]);
