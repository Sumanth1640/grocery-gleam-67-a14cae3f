<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$days = max(1, min(730, (int)($b['days'] ?? 90)));

// Weekly GMV
$wst = db()->prepare("SELECT DATE_FORMAT(created_at, '%x-W%v') AS week,
                            COUNT(*) AS orders, COALESCE(SUM(total),0) AS gmv
                     FROM orders WHERE created_at >= (NOW() - INTERVAL ? DAY)
                     GROUP BY week ORDER BY MIN(created_at) ASC");
$wst->execute([$days]);
$weekly = $wst->fetchAll();
$gmvTotal = 0;
foreach ($weekly as &$w) { $w['orders']=(int)$w['orders']; $w['gmv']=(float)$w['gmv']; $gmvTotal += $w['gmv']; }

// Coupon ROI (best-effort; empty if no coupon_redemptions data)
$couponROI = [];
try {
  $cst = db()->prepare("SELECT c.code,
                              COUNT(cr.id) AS uses,
                              COALESCE(SUM(cr.discount),0) AS discount,
                              COALESCE(SUM(o.total),0) AS revenue
                       FROM coupon_redemptions cr
                       JOIN coupons c ON c.id = cr.coupon_id
                       LEFT JOIN orders o ON o.id = cr.order_id
                       WHERE cr.created_at >= (NOW() - INTERVAL ? DAY)
                       GROUP BY c.id ORDER BY revenue DESC LIMIT 20");
  $cst->execute([$days]);
  foreach ($cst->fetchAll() as $r) {
    $uses=(int)$r['uses']; $disc=(float)$r['discount']; $rev=(float)$r['revenue'];
    $roi = $disc > 0 ? round((($rev - $disc) / $disc) * 100) : 0;
    $couponROI[] = ['code'=>$r['code'],'uses'=>$uses,'discount'=>$disc,'revenue'=>$rev,'roi'=>$roi];
  }
} catch (Throwable $e) { /* table may not exist */ }

// Cohorts (very simple: monthly signup buckets, % who ordered in following months)
$cohorts = [];
try {
  $months = max(3, min(12, intdiv($days, 30)));
  $cst = db()->prepare("SELECT DATE_FORMAT(u.created_at, '%Y-%m') AS cohort,
                              u.id, MIN(DATE_FORMAT(o.created_at, '%Y-%m')) AS first_order
                       FROM users u LEFT JOIN orders o ON o.user_id=u.id
                       WHERE u.created_at >= (NOW() - INTERVAL ? MONTH)
                       GROUP BY u.id ORDER BY cohort ASC");
  $cst->execute([$months]);
  $rows = $cst->fetchAll();
  $byCohort = [];
  foreach ($rows as $r) {
    $c = $r['cohort']; if (!$c) continue;
    if (!isset($byCohort[$c])) $byCohort[$c] = ['size'=>0,'m1'=>0,'m2'=>0,'m3'=>0];
    $byCohort[$c]['size']++;
    if ($r['first_order']) {
      $diff = (int)floor((strtotime($r['first_order'].'-01') - strtotime($c.'-01')) / 2629800);
      if ($diff >= 1 && $diff <= 3) $byCohort[$c]['m'.$diff]++;
    }
  }
  foreach ($byCohort as $c=>$v) {
    $pct = fn($n)=>$v['size']?round(($n/$v['size'])*100):0;
    $cohorts[] = ['cohort'=>$c,'size'=>$v['size'],'m1'=>$pct($v['m1']),'m2'=>$pct($v['m2']),'m3'=>$pct($v['m3'])];
  }
} catch (Throwable $e) { /* ignore */ }

json_ok([
  'gmvTotal'  => $gmvTotal,
  'gmvWeekly' => $weekly,
  'couponROI' => $couponROI,
  'cohorts'   => $cohorts,
]);
