<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('GET');
$uid = current_user_id();
json_ok(partner_my_restaurant($uid));
