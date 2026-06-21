<?php
// Internal endpoint to trigger an FCM push + notifications row.
// Auth: shared secret via header X-Internal-Secret (hardcoded below).
// Call from trusted server code only.
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../notification_helpers.php';
require_method('POST');

// HARDCODED — set this to the same value stored in Lovable secrets (INTERNAL_NOTIFY_SECRET)
$EXPECTED = 'f3a9b2c1d4e5f6789012345678901234abcd5678ef9012345678901234567890ab';
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
