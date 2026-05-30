<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$wid   = (string)($b['warehouse_id'] ?? '');
$email = strtolower(trim((string)($b['email'] ?? '')));
if ($wid==='' || $email==='') json_error('Missing fields');

$st = db()->prepare('SELECT id FROM users WHERE LOWER(email)=? LIMIT 1');
$st->execute([$email]);
$u = $st->fetch();
if (!$u) json_error('No user with that email. They must sign up first.');

try {
  db()->prepare('INSERT INTO warehouse_managers (id,warehouse_id,user_id) VALUES (?,?,?)')
     ->execute([uuid_v4(), $wid, $u['id']]);
} catch (PDOException $e) {
  if ($e->getCode() === '23000') json_error('Already a manager of this warehouse.');
  throw $e;
}
json_ok(['ok'=>true]);
