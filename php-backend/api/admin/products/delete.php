<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$id = (string)(json_body()['id'] ?? '');
if ($id==='') json_error('Missing id');
$st = db()->prepare('DELETE FROM products WHERE id=?');
$st->execute([$id]);
json_ok(['ok' => true]);
