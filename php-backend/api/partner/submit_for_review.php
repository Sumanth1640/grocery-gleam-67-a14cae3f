<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Create restaurant first');
$missing = [];
if (!$r['name'] || !$r['slug'] || !$r['area'] || !$r['owner_email'] || !$r['owner_phone']) $missing[] = 'basic details';
if (!$r['fssai_number'] || !$r['fssai_doc_url']) $missing[] = 'FSSAI license';
if (!$r['pan_number']  || !$r['pan_doc_url'])  $missing[] = 'PAN';
if (!$r['bank_account_number'] || !$r['bank_ifsc'] || !$r['bank_proof_url']) $missing[] = 'bank details';
if (!$r['shop_license_doc_url']) $missing[] = 'shop license';
if (!$r['agreement_accepted_at']) $missing[] = 'partner agreement';
if ($missing) json_error('Please complete: '.implode(', ', $missing));
$u = db()->prepare("UPDATE partner_restaurants SET status='pending', onboarding_step=5, rejection_reason=NULL WHERE id = ?");
$u->execute([$r['id']]);
notify_user($uid, 'system', 'Submitted for review', "We'll verify your documents within 24 hours and notify you.", '/partner');
json_ok(['ok' => true]);
