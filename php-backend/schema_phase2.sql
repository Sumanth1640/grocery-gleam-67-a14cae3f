-- Phase 2 schema additions. Run AFTER schema.sql.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- coupons ----------
CREATE TABLE IF NOT EXISTS coupons (
  id             CHAR(36) PRIMARY KEY,
  code           VARCHAR(40) NOT NULL UNIQUE,
  title          VARCHAR(120) NOT NULL,
  description    VARCHAR(255) DEFAULT NULL,
  discount_type  ENUM('flat','percent') NOT NULL DEFAULT 'flat',
  discount_value INT NOT NULL,
  min_order      INT NOT NULL DEFAULT 0,
  max_discount   INT DEFAULT NULL,
  expires_at     DATETIME DEFAULT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- restaurants ----------
CREATE TABLE IF NOT EXISTS restaurants (
  id            CHAR(36) PRIMARY KEY,
  owner_id      CHAR(36) DEFAULT NULL,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  name          VARCHAR(160) NOT NULL,
  cuisine       VARCHAR(120) NOT NULL DEFAULT '',
  image         TEXT NOT NULL,
  rating        DECIMAL(2,1) NOT NULL DEFAULT 4.2,
  eta           VARCHAR(40) NOT NULL DEFAULT '25 mins',
  price_for_two INT NOT NULL DEFAULT 300,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (owner_id),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- dishes ----------
CREATE TABLE IF NOT EXISTS dishes (
  id             CHAR(36) PRIMARY KEY,
  restaurant_id  CHAR(36) NOT NULL,
  name           VARCHAR(160) NOT NULL,
  description    VARCHAR(500) DEFAULT NULL,
  image          TEXT NOT NULL,
  price          INT NOT NULL,
  is_veg         TINYINT(1) NOT NULL DEFAULT 1,
  category       VARCHAR(80) NOT NULL DEFAULT 'Main',
  is_available   TINYINT(1) NOT NULL DEFAULT 1,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (restaurant_id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add restaurant_id to orders (nullable — orders may be grocery or food)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS restaurant_id CHAR(36) DEFAULT NULL AFTER user_id,
  ADD INDEX IF NOT EXISTS idx_orders_restaurant (restaurant_id);

SET FOREIGN_KEY_CHECKS = 1;

-- ---------- Seed data ----------
INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order, max_discount) VALUES
  (UUID(), 'WELCOME50', 'Welcome ₹50 off', 'On orders above ₹199', 'flat',    50, 199, NULL),
  (UUID(), 'SAVE10',    '10% off',         'Up to ₹100 off',        'percent', 10, 299, 100)
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO restaurants (id, slug, name, cuisine, image, rating, eta, price_for_two) VALUES
  (UUID(), 'spice-route', 'Spice Route', 'North Indian, Biryani', 'https://placehold.co/600x400', 4.4, '28 mins', 350),
  (UUID(), 'pizza-port',  'Pizza Port',  'Italian, Pizza',        'https://placehold.co/600x400', 4.2, '32 mins', 500)
ON DUPLICATE KEY UPDATE name = VALUES(name);
