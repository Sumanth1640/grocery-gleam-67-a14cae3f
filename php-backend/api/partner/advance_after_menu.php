<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$ex = db()->prepare('SELECT id, onboarding_step FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
$ex->execute([$uid]);
$r = $ex->fetch();
if (!$r) json_error('Create restaurant first');
$c = db()->prepare('SELECT COUNT(*) c FROM partner_dishes WHERE restaurant_id = ?');
$c->execute([$r['id']]);
$count = (int)$c->fetch()['c'];
if ($count < 1) json_error('Add at least one dish to your menu first');
$next = max((int)$r['onboarding_step'], 4);
$u = db()->prepare('UPDATE partner_restaurants SET onboarding_step = ? WHERE id = ?');
$u->execute([$next, $r['id']]);
json_ok(['ok' => true]);
