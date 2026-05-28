<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$type = $_GET['target_type'] ?? null;
$id   = $_GET['target_id'] ?? null;
if (!$type || !$id) json_error('target_type and target_id required');

$stmt = db()->prepare('
  SELECT r.id, r.user_id, r.rating, r.title, r.body, r.created_at,
         u.email AS user_email
  FROM reviews r
  LEFT JOIN users u ON u.id = r.user_id
  WHERE r.target_type = ? AND r.target_id = ?
  ORDER BY r.created_at DESC LIMIT 100
');
$stmt->execute([$type, $id]);
$rows = array_map(function ($r) {
  $r['rating'] = (int)$r['rating'];
  return $r;
}, $stmt->fetchAll());

// Aggregate
$agg = db()->prepare('SELECT AVG(rating) avg_rating, COUNT(*) cnt FROM reviews WHERE target_type = ? AND target_id = ?');
$agg->execute([$type, $id]);
$a = $agg->fetch();
json_ok([
  'reviews' => $rows,
  'avg'     => $a['avg_rating'] !== null ? round((float)$a['avg_rating'], 1) : null,
  'count'   => (int)$a['cnt'],
]);
