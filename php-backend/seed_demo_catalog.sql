-- Demo seed: 8 categories x 3-4 products + 2 restaurants x 4 dishes.
-- All images use online URLs. Import AFTER schema.sql / schema_phase*.sql.
-- Safe to re-run: products use ON DUPLICATE KEY (slug), restaurants too.
--
-- IMPORTANT: partner_restaurants.owner_id is a FK to users(id). Set @owner
-- below to a real partner user UUID (SELECT id, email FROM users;) before
-- running the restaurants/dishes section.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CATEGORIES (8)
-- =====================================================
INSERT INTO categories (id, slug, name, image, tint, sort_order) VALUES
  (UUID(), 'vegetables',    'Vegetables',          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400', '#e8f5e9', 1),
  (UUID(), 'fruits',        'Fresh Fruits',        'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', '#fff3e0', 2),
  (UUID(), 'dairy',         'Dairy & Eggs',        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',   '#fff8e1', 3),
  (UUID(), 'bakery',        'Bakery',              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', '#f3e5f5', 4),
  (UUID(), 'snacks',        'Snacks',              'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', '#fce4ec', 5),
  (UUID(), 'beverages',     'Beverages',           'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', '#e3f2fd', 6),
  (UUID(), 'household',     'Household',           'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', '#ede7f6', 7),
  (UUID(), 'personal-care', 'Personal Care',       'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',   '#e0f7fa', 8)
ON DUPLICATE KEY UPDATE name = VALUES(name), image = VALUES(image), tint = VALUES(tint), sort_order = VALUES(sort_order);

-- =====================================================
-- PRODUCTS (3-4 per category)
-- =====================================================
INSERT INTO products (id, slug, name, category_slug, image, weight, price, mrp, eta, rating, in_stock) VALUES
  -- Vegetables
  (UUID(), 'veg-tomato',  'Tomato Local',  'vegetables', 'https://images.unsplash.com/photo-1546470427-e3e1f1c9c1d6?w=400', '1 kg',   35,  45, '10 mins', 4.2, 1),
  (UUID(), 'veg-onion',   'Onion',         'vegetables', 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400','1 kg',   39,  50, '10 mins', 4.3, 1),
  (UUID(), 'veg-potato',  'Potato',        'vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400','1 kg',   32,  40, '10 mins', 4.1, 1),
  (UUID(), 'veg-carrot',  'Carrot',        'vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400','500 g',  29,  40, '10 mins', 4.3, 1),
  -- Fruits
  (UUID(), 'fr-banana',   'Robusta Banana','fruits',     'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400','1 kg',   49,  60, '10 mins', 4.4, 1),
  (UUID(), 'fr-apple',    'Shimla Apple',  'fruits',     'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400','1 kg',  189, 220, '10 mins', 4.6, 1),
  (UUID(), 'fr-orange',   'Nagpur Orange', 'fruits',     'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', '1 kg',   99, 130, '10 mins', 4.4, 1),
  (UUID(), 'fr-mango',    'Alphonso Mango','fruits',     'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', '1 kg',  299, 360, '10 mins', 4.7, 1),
  -- Dairy
  (UUID(), 'da-milk',     'Amul Gold Milk','dairy',      'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400', '500 ml', 35,  38, '10 mins', 4.7, 1),
  (UUID(), 'da-butter',   'Amul Butter',   'dairy',      'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400','100 g',  58,  62, '10 mins', 4.8, 1),
  (UUID(), 'da-eggs',     'Farm Eggs (6)', 'dairy',      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400','6 pcs',  55,  60, '10 mins', 4.5, 1),
  (UUID(), 'da-curd',     'Fresh Curd',    'dairy',      'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400','400 g',  45,  55, '10 mins', 4.4, 1),
  -- Bakery
  (UUID(), 'bk-bread',    'Britannia Bread',     'bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400','400 g',  45,  50, '10 mins', 4.4, 1),
  (UUID(), 'bk-parleg',   'Parle-G Biscuits',    'bakery', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', '800 g',  95, 100, '10 mins', 4.7, 1),
  (UUID(), 'bk-cookies',  'Choco Chip Cookies',  'bakery', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400','200 g', 120, 150, '10 mins', 4.5, 1),
  (UUID(), 'bk-bun',      'Fresh Buns (4 pcs)',  'bakery', 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=400','4 pcs',  35,  40, '10 mins', 4.2, 1),
  -- Snacks
  (UUID(), 'sn-lays',     'Lays Classic Salted', 'snacks', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400','52 g',  20,  20, '10 mins', 4.4, 1),
  (UUID(), 'sn-kurkure',  'Kurkure Masala Munch','snacks', 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400','90 g',  20,  20, '10 mins', 4.3, 1),
  (UUID(), 'sn-haldiram', 'Haldiram Bhujia',     'snacks', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400','200 g', 65,  75, '10 mins', 4.6, 1),
  (UUID(), 'sn-popcorn',  'Act II Popcorn',      'snacks', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400','70 g',  30,  35, '10 mins', 4.3, 1),
  -- Beverages
  (UUID(), 'bv-coke',     'Coca-Cola',             'beverages','https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400','750 ml', 40,  45, '10 mins', 4.6, 1),
  (UUID(), 'bv-tropicana','Tropicana Orange Juice','beverages','https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400','1 L',   115, 130, '10 mins', 4.5, 1),
  (UUID(), 'bv-sprite',   'Sprite',                'beverages','https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400','750 ml', 40,  45, '10 mins', 4.5, 1),
  (UUID(), 'bv-redbull',  'Red Bull Energy',       'beverages','https://images.unsplash.com/photo-1613218985075-86440fa1ce1c?w=400','250 ml',125, 130, '10 mins', 4.7, 1),
  -- Household
  (UUID(), 'hh-surf',     'Surf Excel Easy Wash',  'household','https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400','1 kg',  180, 215, '11 mins', 4.5, 1),
  (UUID(), 'hh-vim',      'Vim Dishwash Bar',      'household','https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400','300 g',  30,  35, '11 mins', 4.4, 1),
  (UUID(), 'hh-harpic',   'Harpic Toilet Cleaner', 'household','https://images.unsplash.com/photo-1585670210693-1aaf3a3c80df?w=400','1 L',   125, 145, '11 mins', 4.6, 1),
  -- Personal Care
  (UUID(), 'pc-colgate',  'Colgate MaxFresh',         'personal-care','https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400','150 g', 95, 110, '11 mins', 4.5, 1),
  (UUID(), 'pc-dove',     'Dove Beauty Bar',          'personal-care','https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400','100 g', 55,  65, '11 mins', 4.6, 1),
  (UUID(), 'pc-shampoo',  'Head & Shoulders Shampoo', 'personal-care','https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400','340 ml',299,360,'11 mins', 4.5, 1),
  (UUID(), 'pc-handwash', 'Dettol Handwash',          'personal-care','https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=400','200 ml', 75,  85, '11 mins', 4.4, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), mrp = VALUES(mrp), image = VALUES(image), category_slug = VALUES(category_slug);

-- =====================================================
-- RESTAURANTS (2) + DISHES (4 each)
-- Set @owner to a real partner user UUID before running.
-- =====================================================
SET @owner := (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

INSERT INTO partner_restaurants
  (id, owner_id, slug, name, cuisines, image, cover, rating, reviews_count, eta_mins,
   cost_for_two, area, price_tier, distance_km, veg, offer, is_open, status,
   agreement_accepted_at, is_blocked,
   fssai_doc_url, pan_doc_url, shop_license_doc_url, bank_proof_url,
   owner_name, owner_email, owner_phone)
VALUES
  (UUID(), @owner, 'spice-route', 'Spice Route',
   JSON_ARRAY('North Indian','Biryani'),
   'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
   4.4, 320, 28, 350, 'Indiranagar', 2, 1.5, 0, '50% OFF up to ₹100', 1, 'approved',
   NOW(), 0,
   '', '', '', '',
   'Spice Owner', 'spice@example.com', '9999900001'),
  (UUID(), @owner, 'pizza-port', 'Pizza Port',
   JSON_ARRAY('Italian','Pizza'),
   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
   'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200',
   4.2, 210, 32, 500, 'Koramangala', 3, 2.1, 0, 'Buy 1 Get 1', 1, 'approved',
   NOW(), 0,
   '', '', '', '',
   'Pizza Owner', 'pizza@example.com', '9999900002')
ON DUPLICATE KEY UPDATE
  name = VALUES(name), status = 'approved', agreement_accepted_at = NOW(),
  is_blocked = 0, is_open = 1;

-- Dishes — joined by restaurant slug so re-running is safe.
INSERT INTO partner_dishes
  (id, restaurant_id, name, description, image, section, price, mrp, veg, spicy, bestseller, in_stock, sort_order)
SELECT UUID(), r.id, d.name, d.description, d.image, d.section, d.price, d.mrp, d.veg, d.spicy, d.bestseller, 1, d.sort_order
FROM partner_restaurants r
JOIN (
  SELECT 'spice-route' slug, 'Chicken Biryani'      name, 'Long-grain basmati, slow-cooked dum biryani'  description, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600' image, 'Biryani'  section, 289 price, 349 mrp, 0 veg, 1 spicy, 1 bestseller, 1 sort_order UNION ALL
  SELECT 'spice-route','Paneer Butter Masala','Creamy tomato gravy with soft paneer','https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600','Mains',   229,269,1,0,0,2 UNION ALL
  SELECT 'spice-route','Garlic Naan',         'Tandoor-baked, brushed with butter',  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600','Breads',   49, 60,1,0,0,3 UNION ALL
  SELECT 'spice-route','Gulab Jamun',         'Warm syrup-soaked dessert (2 pcs)',   'https://images.unsplash.com/photo-1601303516534-bf18d6d22e74?w=600','Desserts', 79, 99,1,0,0,4 UNION ALL
  SELECT 'pizza-port', 'Margherita Pizza',    'Classic mozzarella & basil',          'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600','Pizza',   299,349,1,0,1,1 UNION ALL
  SELECT 'pizza-port', 'Pepperoni Pizza',     'Loaded with pepperoni & mozzarella',  'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600','Pizza',   449,499,0,0,0,2 UNION ALL
  SELECT 'pizza-port', 'Garlic Bread',        'Cheesy garlic bread sticks',          'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600','Sides',  149,179,1,0,0,3 UNION ALL
  SELECT 'pizza-port', 'Choco Lava Cake',     'Molten chocolate centre',             'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600','Desserts',129,149,1,0,1,4
) d ON d.slug = r.slug
LEFT JOIN partner_dishes pd ON pd.restaurant_id = r.id AND pd.name = d.name
WHERE pd.id IS NULL;

SET FOREIGN_KEY_CHECKS = 1;
