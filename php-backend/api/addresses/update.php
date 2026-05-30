<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$uid = current_user_id();
$in  = json_body();

$id = trim((string)($in['id'] ?? ''));
if (!$id) json_error('id required');

$full_name = trim((string)($in['full_name'] ?? ''));
$phone     = trim((string)($in['phone'] ?? ''));
$line1     = trim((string)($in['line1'] ?? ''));
$line2     = trim((string)($in['line2'] ?? ''));
$city      = trim((string)($in['city'] ?? ''));
$pincode   = trim((string)($in['pincode'] ?? ''));
$type      = $in['type'] ?? 'Home';
$is_default = !empty($in['is_default']) ? 1 : 0;

if (!$full_name || !$phone || !$line1 || !$city || !$pincode) {
  json_error('full_name, phone, line1, city, pincode are required');
}
if (!in_array($type, ['Home','Work','Other'], true)) $type = 'Home';

$pdo = db();
$pdo->beginTransaction();
try {
  // Ownership check
  $own = $pdo->prepare('SELECT 1 FROM addresses WHERE id = ? AND user_id = ?');
  $own->execute([$id, $uid]);
  if (!$own->fetchColumn()) { $pdo->rollBack(); json_error('Address not found', 404); }

  if ($is_default) {
    $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$uid]);
  }
  $pdo->prepare('
    UPDATE addresses
       SET full_name=?, phone=?, line1=?, line2=?, city=?, pincode=?, type=?, is_default=?
     WHERE id = ? AND user_id = ?
  ')->execute([
    $full_name, $phone, $line1, $line2 ?: null, $city, $pincode, $type, $is_default,
    $id, $uid,
  ]);
  $pdo->commit();
  json_ok(['id' => $id, 'updated' => 1]);
} catch (Throwable $e) {
  $pdo->rollBack();
  json_error('Failed to update address: ' . $e->getMessage(), 500);
}
