<?php
require __DIR__ . '/../../config.php';
require_method('GET');

// PHP backend has no coupon_redemptions table — return an empty usage map.
// The frontend uses this to disable per-user coupon limits; without it,
// coupons remain validatable on the server-side `coupons/validate.php`.
current_user_id(); // require auth
json_ok((object)[]);
