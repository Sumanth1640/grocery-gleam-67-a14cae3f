<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$id = (string)(json_body()['id'] ?? '');
if ($id === '') json_error('Missing id');
db()->prepare('DELETE FROM furniture_promos WHERE id=?')->execute([$id]);
json_ok(['ok' => true]);
