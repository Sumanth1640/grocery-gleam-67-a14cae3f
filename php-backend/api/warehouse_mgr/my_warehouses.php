<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();
$st = db()->prepare(
  "SELECT w.id, w.name, w.code, w.city, w.pincode
     FROM warehouse_managers wm
     JOIN warehouses w ON w.id = wm.warehouse_id
    WHERE wm.user_id = ?
    ORDER BY w.name ASC"
);
$st->execute([$uid]);
json_ok($st->fetchAll());
