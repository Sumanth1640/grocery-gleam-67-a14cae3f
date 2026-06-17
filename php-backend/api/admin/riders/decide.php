<?php
require_once __DIR__ . '/../../../rider_helpers.php';
require_method('POST');
require_admin();
$b = json_body();
$rider_id = (string)($b['rider_id'] ?? '');
$approve  = !empty($b['approve']);
$reason   = trim((string)($b['reason'] ?? ''));
if ($rider_id === '') json_error('Missing rider_id');

$st = db()->prepare('SELECT id, user_id, preferred_outlets, preferred_pincodes FROM riders WHERE id = ?');
$st->execute([$rider_id]);
$rider = $st->fetch();
if (!$rider) json_error('Rider not found', 404);

if ($approve) {
  db()->prepare("UPDATE riders SET status='approved', is_active=1, rejection_reason=NULL WHERE id=?")
     ->execute([$rider_id]);

  if ($rider['user_id']) {
    // Grant rider role (idempotent)
    db()->prepare('INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?,?,?)')
       ->execute([uuid_v4(), $rider['user_id'], 'rider']);
    notify_user($rider['user_id'], 'system', "You're approved 🎉",
      'You can now start accepting deliveries.', '/rider');
  }

  // Auto-attach requested coverage if admin hasn't set any yet
  $st = db()->prepare('SELECT COUNT(*) FROM rider_outlets WHERE rider_id = ?');
  $st->execute([$rider_id]);
  if ((int)$st->fetchColumn() === 0) {
    $outlets = $rider['preferred_outlets'] ? json_decode($rider['preferred_outlets'], true) : [];
    if (is_array($outlets) && $outlets) {
      $ins = db()->prepare('INSERT IGNORE INTO rider_outlets (rider_id, outlet_id) VALUES (?, ?)');
      foreach ($outlets as $oid) if (is_string($oid) && $oid !== '') $ins->execute([$rider_id, $oid]);
    }
  }

  $st = db()->prepare('SELECT COUNT(*) FROM rider_pincodes WHERE rider_id = ?');
  $st->execute([$rider_id]);
  if ((int)$st->fetchColumn() === 0) {
    $pins = $rider['preferred_pincodes'] ? json_decode($rider['preferred_pincodes'], true) : [];
    if (is_array($pins)) {
      $ins = db()->prepare('INSERT IGNORE INTO rider_pincodes (rider_id, pincode) VALUES (?, ?)');
      foreach (array_unique($pins) as $p) {
        if (is_string($p) && preg_match('/^\d{6}$/', $p)) $ins->execute([$rider_id, $p]);
      }
    }
  }
} else {
  db()->prepare("UPDATE riders SET status='rejected', is_active=0, rejection_reason=? WHERE id=?")
     ->execute([$reason ?: null, $rider_id]);
  if ($rider['user_id']) {
    notify_user($rider['user_id'], 'system', 'Rider application update',
      $reason ?: 'Your rider application was not approved.', '/rider');
  }
}
json_ok(['ok' => true]);
