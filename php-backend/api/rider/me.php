<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('GET');
$uid = current_user_id();
$r = rider_for_user($uid);
if ($r) {
  $r['is_active'] = (bool)$r['is_active'];
  $r['preferred_outlets']  = $r['preferred_outlets']  ? json_decode($r['preferred_outlets'],  true) : [];
  $r['preferred_pincodes'] = $r['preferred_pincodes'] ? json_decode($r['preferred_pincodes'], true) : [];
}
json_ok(['rider' => $r]);
