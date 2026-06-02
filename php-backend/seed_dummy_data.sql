-- Dummy seed data for HalliFresh PHP backend (MySQL)
-- Import AFTER schema.sql, schema_phase2.sql, schema_phase3.sql, schema_phase4.sql
-- in phpMyAdmin. Safe to re-run: uses ON DUPLICATE KEY UPDATE on unique slugs/codes.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (id, slug, name, image, tint, sort_order) VALUES
  (UUID(), 'fruits',     'Fruits & Vegetables', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', '#e8f5e9', 1),
  (UUID(), 'dairy',      'Dairy & Eggs',        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',   '#fff8e1', 2),
  (UUID(), 'staples',    'Atta, Rice & Dal',    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', '#fff3e0', 3),
  (UUID(), 'snacks',     'Snacks & Munchies',   'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', '#fce4ec', 4),
  (UUID(), 'beverages',  'Cold Drinks & Juices','https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '#e3f2fd', 5),
  (UUID(), 'bakery',     'Bakery & Biscuits',   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '#f3e5f5', 6),
  (UUID(), 'personal',   'Personal Care',       'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',   '#e0f7fa', 7),
  (UUID(), 'household',  'Household Essentials','https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '#ede7f6', 8)
ON DUPLICATE KEY UPDATE name = VALUES(name), image = VALUES(image), tint = VALUES(tint), sort_order = VALUES(sort_order);

-- =====================================================
-- PRODUCTS
-- =====================================================
INSERT INTO products (id, slug, name, category_slug, image, weight, price, mrp, eta, rating, in_stock) VALUES
  (UUID(), 'banana-robusta-1kg',  'Robusta Banana',         'fruits',    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', '1 kg',    49,  60, '10 mins', 4.4, 1),
  (UUID(), 'apple-shimla-1kg',    'Shimla Apple',           'fruits',    'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400', '1 kg',   189, 220, '10 mins', 4.6, 1),
  (UUID(), 'tomato-1kg',          'Tomato Local',           'fruits',    'https://images.unsplash.com/photo-1546470427-e3e1f1c9c1d6?w=400',   '1 kg',    35,  45, '10 mins', 4.2, 1),
  (UUID(), 'onion-1kg',           'Onion',                  'fruits',    'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400', '1 kg',    39,  50, '10 mins', 4.3, 1),
  (UUID(), 'amul-milk-500ml',     'Amul Gold Milk',         'dairy',     'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',   '500 ml',  35,  38, '10 mins', 4.7, 1),
  (UUID(), 'amul-butter-100g',    'Amul Butter',            'dairy',     'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', '100 g',   58,  62, '10 mins', 4.8, 1),
  (UUID(), 'eggs-6pc',            'Farm Eggs (6 pcs)',      'dairy',     'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', '6 pcs',   55,  60, '10 mins', 4.5, 1),
  (UUID(), 'tata-salt-1kg',       'Tata Salt',              'staples',   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', '1 kg',    28,  30, '11 mins', 4.6, 1),
  (UUID(), 'aashirvaad-atta-5kg', 'Aashirvaad Atta',        'staples',   'https://images.unsplash.com/photo-1568826051718-9d4e3ec0db00?w=400', '5 kg',   265, 305, '11 mins', 4.7, 1),
  (UUID(), 'basmati-rice-1kg',    'India Gate Basmati',     'staples',   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', '1 kg',   135, 160, '11 mins', 4.5, 1),
  (UUID(), 'lays-classic-52g',    'Lay''s Classic Salted',  'snacks',    'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', '52 g',    20,  20, '10 mins', 4.4, 1),
  (UUID(), 'kurkure-90g',         'Kurkure Masala Munch',   'snacks',    'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', '90 g',    20,  20, '10 mins', 4.3, 1),
  (UUID(), 'coke-750ml',          'Coca-Cola',              'beverages', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '750 ml',  40,  45, '10 mins', 4.6, 1),
  (UUID(), 'tropicana-1l',        'Tropicana Orange Juice', 'beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', '1 L',    115, 130, '10 mins', 4.5, 1),
  (UUID(), 'britannia-bread',     'Britannia Bread',        'bakery',    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '400 g',   45,  50, '10 mins', 4.4, 1),
  (UUID(), 'parle-g-800g',        'Parle-G Biscuits',       'bakery',    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',   '800 g',   95, 100, '10 mins', 4.7, 1),
  (UUID(), 'colgate-150g',        'Colgate MaxFresh',       'personal',  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',   '150 g',   95, 110, '11 mins', 4.5, 1),
  (UUID(), 'dove-soap-100g',      'Dove Beauty Bar',        'personal',  'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400', '100 g',   55,  65, '11 mins', 4.6, 1),
  (UUID(), 'surf-excel-1kg',      'Surf Excel Easy Wash',   'household', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '1 kg',   180, 215, '11 mins', 4.5, 1),
  (UUID(), 'vim-bar-300g',        'Vim Dishwash Bar',       'household', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '300 g',   30,  35, '11 mins', 4.4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), mrp = VALUES(mrp), image = VALUES(image);

-- =====================================================
-- WAREHOUSES
-- =====================================================
INSERT INTO warehouses (id, name, code, address, city, pincode, lat, lng, is_active, sort_order) VALUES
  (UUID(), 'Indiranagar Hub',  'BLR-IND', '100 Ft Road, Indiranagar',  'Bengaluru', '560038', 12.9719, 77.6412, 1, 1),
  (UUID(), 'Koramangala Hub',  'BLR-KOR', '80 Ft Road, Koramangala 4 Block', 'Bengaluru', '560034', 12.9352, 77.6245, 1, 2),
  (UUID(), 'Whitefield Hub',   'BLR-WHT', 'ITPL Main Road, Whitefield','Bengaluru', '560066', 12.9698, 77.7500, 1, 3),
  (UUID(), 'HSR Layout Hub',   'BLR-HSR', '27th Main, HSR Sector 1',   'Bengaluru', '560102', 12.9116, 77.6473, 1, 4)
ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address);

-- Warehouse pincode coverage
INSERT INTO warehouse_pincodes (id, warehouse_id, pincode, priority)
SELECT UUID(), w.id, p.pincode, p.priority FROM warehouses w
JOIN (
  SELECT 'BLR-IND' code, '560038' pincode, 10 priority UNION ALL
  SELECT 'BLR-IND', '560008', 8  UNION ALL
  SELECT 'BLR-IND', '560042', 6  UNION ALL
  SELECT 'BLR-KOR', '560034', 10 UNION ALL
  SELECT 'BLR-KOR', '560095', 8  UNION ALL
  SELECT 'BLR-KOR', '560047', 6  UNION ALL
  SELECT 'BLR-WHT', '560066', 10 UNION ALL
  SELECT 'BLR-WHT', '560067', 8  UNION ALL
  SELECT 'BLR-HSR', '560102', 10 UNION ALL
  SELECT 'BLR-HSR', '560068', 8
) p ON p.code = w.code;

-- =====================================================
-- RESTAURANTS (partner_restaurants — approved + open)
-- NOTE: owner_id references users(id). Replace <OWNER_USER_ID> below with
-- a real user UUID from `SELECT id, email FROM users;` before running,
-- OR comment this block out if you have no partner users yet.
-- =====================================================
-- SET @owner := '<OWNER_USER_ID>';
-- INSERT INTO partner_restaurants
--   (id, owner_id, slug, name, cuisines, image, cover, rating, reviews_count, eta_mins,
--    cost_for_two, area, price_tier, distance_km, veg, offer, is_open, status,
--    fssai_doc_url, pan_doc_url, shop_license_doc_url, bank_proof_url, owner_name, owner_email, owner_phone)
-- VALUES
--   (UUID(), @owner, 'spice-route',     'Spice Route',     JSON_ARRAY('North Indian','Biryani'),  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',  4.4, 320, 28, 350, 'Indiranagar', 2, 1.5, 0, '50% OFF up to ₹100', 1, 'approved', '', '', '', '', 'Spice Owner','spice@example.com','9999900001'),
--   (UUID(), @owner, 'pizza-port',      'Pizza Port',      JSON_ARRAY('Italian','Pizza'),         'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200', 4.2, 210, 32, 500, 'Koramangala', 3, 2.1, 0, 'Buy 1 Get 1',         1, 'approved', '', '', '', '', 'Pizza Owner','pizza@example.com','9999900002'),
--   (UUID(), @owner, 'south-spice',     'South Spice',     JSON_ARRAY('South Indian','Dosa'),     'https://images.unsplash.com/photo-1630383249896-424e482df921?w=600','https://images.unsplash.com/photo-1630383249896-424e482df921?w=1200', 4.6, 540, 22, 250, 'HSR Layout',  1, 0.9, 1, 'Free Delivery',       1, 'approved', '', '', '', '', 'South Owner','south@example.com','9999900003'),
--   (UUID(), @owner, 'wok-and-roll',    'Wok & Roll',      JSON_ARRAY('Chinese','Asian'),         'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600','https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200',   4.3, 180, 35, 450, 'Whitefield',  2, 3.0, 0, '20% OFF',             1, 'approved', '', '', '', '', 'Wok Owner','wok@example.com','9999900004')
-- ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- DISHES (partner_dishes) — depends on partner_restaurants above
-- Uncomment after seeding restaurants. Joins by restaurant slug.
-- =====================================================
-- INSERT INTO partner_dishes
--   (id, restaurant_id, name, description, image, section, price, mrp, veg, spicy, bestseller, in_stock, sort_order)
-- SELECT UUID(), r.id, d.name, d.description, d.image, d.section, d.price, d.mrp, d.veg, d.spicy, d.bestseller, 1, d.sort_order
-- FROM partner_restaurants r
-- JOIN (
--   SELECT 'spice-route' slug, 'Chicken Biryani'   name, 'Long-grain basmati, slow-cooked' description, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600' image, 'Biryani' section, 289 price, 349 mrp, 0 veg, 1 spicy, 1 bestseller, 1 sort_order UNION ALL
--   SELECT 'spice-route','Paneer Butter Masala','Creamy tomato gravy','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600','Mains',229,269,1,0,0,2 UNION ALL
--   SELECT 'spice-route','Garlic Naan','Tandoor-baked','https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600','Breads',49,60,1,0,0,3 UNION ALL
--   SELECT 'pizza-port','Margherita Pizza','Classic mozzarella & basil','https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600','Pizza',299,349,1,0,1,1 UNION ALL
--   SELECT 'pizza-port','Pepperoni Pizza','Loaded pepperoni','https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600','Pizza',449,499,0,0,0,2 UNION ALL
--   SELECT 'south-spice','Masala Dosa','Crispy with potato masala','https://images.unsplash.com/photo-1630383249896-424e482df921?w=600','Mains',119,140,1,0,1,1 UNION ALL
--   SELECT 'south-spice','Filter Coffee','Hot, strong','https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600','Beverages',49,60,1,0,0,2 UNION ALL
--   SELECT 'wok-and-roll','Veg Hakka Noodles','Stir-fried','https://images.unsplash.com/photo-1552611052-33e04de081de?w=600','Mains',179,210,1,0,0,1 UNION ALL
--   SELECT 'wok-and-roll','Chilli Chicken','Indo-Chinese','https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600','Mains',249,289,0,1,1,2
-- ) d ON d.slug = r.slug;

SET FOREIGN_KEY_CHECKS = 1;
