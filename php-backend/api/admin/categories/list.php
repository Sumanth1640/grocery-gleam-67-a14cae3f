<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
json_ok(db()->query('SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC')->fetchAll());
