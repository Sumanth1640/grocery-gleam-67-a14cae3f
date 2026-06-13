<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();

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
  // Dedupe: if the same user already has an address with matching
  // line1 + pincode + phone, return that id instead of inserting a duplicate.
  // This protects against the checkout "save address" running on every order.
  $dup = $pdo->prepare('
    SELECT id FROM addresses
     WHERE user_id = ? AND line1 = ? AND pincode = ? AND phone = ?
     LIMIT 1
  ');
  $dup->execute([$uid, $line1, $pincode, $phone]);
  $existingId = $dup->fetchColumn();

  if ($existingId) {
    // Optionally bump it to default if the client asked for that.
    if ($is_default) {
      $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$uid]);
      $pdo->prepare('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?')
          ->execute([$existingId, $uid]);
    }
    $pdo->commit();
    json_ok(['id' => $existingId, 'deduped' => 1], 200);
  }

  if ($is_default) {
    $pdo->prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')->execute([$uid]);
  }
  $id = uuid_v4();
  $pdo->prepare('
    INSERT INTO addresses (id, user_id, full_name, phone, line1, line2, city, pincode, type, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ')->execute([$id, $uid, $full_name, $phone, $line1, $line2 ?: null, $city, $pincode, $type, $is_default]);
  $pdo->commit();
  json_ok(['id' => $id], 201);
} catch (Throwable $e) {
  $pdo->rollBack();
  json_error('Failed to save address: ' . $e->getMessage(), 500);
}
