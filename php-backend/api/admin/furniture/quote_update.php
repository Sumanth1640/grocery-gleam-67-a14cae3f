<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$note = (string)($b['admin_note'] ?? '');
$allowed = ['new','contacted','quoted','converted','closed'];
if ($id === '' || !in_array($status, $allowed, true)) json_error('Invalid input');
$st = db()->prepare('UPDATE furniture_quotes SET status=?, admin_note=? WHERE id=?');
$st->execute([$status, $note, $id]);
json_ok(['ok' => true]);
