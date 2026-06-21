<?php
// Internal endpoint to trigger an FCM push + notifications row.
// Auth: shared secret via header X-Internal-Secret (set INTERNAL_NOTIFY_SECRET in env
// or edit the fallback constant below). Call from trusted server code only.
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../notification_helpers.php';
require_method('POST');

$EXPECTED = getenv('INTERNAL_NOTIFY_SECRET') ?: 'CHANGE_ME_INTERNAL_NOTIFY_SECRET';
$got = $_SERVER['HTTP_X_INTERNAL_SECRET'] ?? '';
if (!$EXPECTED || !hash_equals($EXPECTED, $got)) json_error('Unauthorized', 401);

$b = json_body();
$user_id = (string)($b['user_id'] ?? '');
$kind    = (string)($b['kind'] ?? 'system');
$title   = (string)($b['title'] ?? '');
$body    = (string)($b['body'] ?? '');
$link    = (string)($b['link'] ?? '/');
if ($user_id === '' || $title === '') json_error('Missing fields');

notify_user($user_id, $kind, $title, $body, $link);
json_ok(['ok' => true]);
