<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$sig = trim((string)($b['agreement_signature'] ?? ''));
$ver = trim((string)($b['agreement_version'] ?? 'v1.0'));
if (strlen($sig) < 2) json_error('Signature required');
$ex = db()->prepare('SELECT id, onboarding_step FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
$ex->execute([$uid]);
$r = $ex->fetch();
if (!$r) json_error('Create restaurant first');
$next = max((int)$r['onboarding_step'], 5);
$u = db()->prepare('UPDATE partner_restaurants
  SET agreement_accepted_at = NOW(), agreement_signature = ?, agreement_version = ?, onboarding_step = ?
  WHERE id = ?');
$u->execute([$sig, $ver, $next, $r['id']]);
json_ok(['ok' => true]);
