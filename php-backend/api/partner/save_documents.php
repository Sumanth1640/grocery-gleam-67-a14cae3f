<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();

$cols = [
  'fssai_number','fssai_doc_url','fssai_expiry',
  'pan_number','pan_doc_url',
  'gst_number','gst_doc_url',
  'bank_account_name','bank_account_number','bank_ifsc','bank_proof_url',
  'shop_license_doc_url',
];
foreach (['fssai_number','fssai_doc_url','fssai_expiry','pan_number','pan_doc_url','bank_account_name','bank_account_number','bank_ifsc','bank_proof_url','shop_license_doc_url'] as $req) {
  if (empty($b[$req])) json_error("Missing $req");
}

$ex = db()->prepare('SELECT id, onboarding_step FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
$ex->execute([$uid]);
$existing = $ex->fetch();
if (!$existing) json_error('Complete basics first', 400);

$set = []; $vals = [];
foreach ($cols as $c) {
  $val = $b[$c] ?? null;
  if (($c === 'gst_number' || $c === 'gst_doc_url') && $val === '') $val = null;
  $set[] = "$c = ?";
  $vals[] = $val;
}
$next = max((int)($existing['onboarding_step'] ?? 2), 3);
$set[] = 'onboarding_step = ?'; $vals[] = $next;
$vals[] = $existing['id']; $vals[] = $uid;
$stmt = db()->prepare('UPDATE partner_restaurants SET '.implode(', ', $set).' WHERE id = ? AND owner_id = ?');
$stmt->execute($vals);
json_ok(['ok' => true]);
