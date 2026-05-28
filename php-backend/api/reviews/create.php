<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$type   = $in['target_type'] ?? null;
$tid    = $in['target_id']   ?? null;
$rating = (int)($in['rating'] ?? 0);
$title  = trim($in['title'] ?? '');
$body   = trim($in['body'] ?? '');

if (!in_array($type, ['product','restaurant','dish'], true)) json_error('invalid target_type');
if (!$tid) json_error('target_id required');
if ($rating < 1 || $rating > 5) json_error('rating must be 1..5');

$id = uuid_v4();
$stmt = db()->prepare('
  INSERT INTO reviews (id, user_id, target_type, target_id, rating, title, body)
  VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([$id, $uid, $type, $tid, $rating, $title ?: null, $body ?: null]);
json_ok(['id' => $id], 201);
