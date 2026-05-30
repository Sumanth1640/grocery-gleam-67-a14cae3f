-- Phase 4 schema additions — Admin / Warehouse / Restaurant Partner parity.
-- Run AFTER schema.sql, schema_phase2.sql, schema_phase3.sql in phpMyAdmin.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Roles
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id         CHAR(36) PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  role       ENUM('admin','moderator','user') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_role (user_id, role),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Warehouses (grocery fulfillment)
-- ============================================================
CREATE TABLE IF NOT EXISTS warehouses (
  id         CHAR(36) PRIMARY KEY,
  name       VARCHAR(160) NOT NULL,
  code       VARCHAR(40)  NOT NULL UNIQUE,
  address    TEXT NOT NULL,
  city       VARCHAR(80)  NOT NULL DEFAULT '',
  pincode    VARCHAR(12)  NOT NULL DEFAULT '',
  lat        DECIMAL(10,7) DEFAULT NULL,
  lng        DECIMAL(10,7) DEFAULT NULL,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS warehouse_pincodes (
  id           CHAR(36) PRIMARY KEY,
  warehouse_id CHAR(36) NOT NULL,
  pincode      VARCHAR(12) NOT NULL,
  priority     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pincode (pincode),
  INDEX idx_warehouse (warehouse_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS warehouse_managers (
  id           CHAR(36) PRIMARY KEY,
  warehouse_id CHAR(36) NOT NULL,
  user_id      CHAR(36) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wh_user (warehouse_id, user_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_stock (
  id                   CHAR(36) PRIMARY KEY,
  warehouse_id         CHAR(36) NOT NULL,
  product_id           CHAR(36) NOT NULL,
  qty                  INT NOT NULL DEFAULT 0,
  low_stock_threshold  INT NOT NULL DEFAULT 5,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wh_product (warehouse_id, product_id),
  INDEX idx_product (product_id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Restaurant partners (replaces phase2 `restaurants`/`dishes` for parity)
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_restaurants (
  id                   CHAR(36) PRIMARY KEY,
  owner_id             CHAR(36) NOT NULL,
  slug                 VARCHAR(80) NOT NULL UNIQUE,
  name                 VARCHAR(160) NOT NULL,
  cuisines             JSON NOT NULL,
  image                TEXT NOT NULL,
  cover                TEXT NOT NULL,
  rating               DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  reviews_count        INT NOT NULL DEFAULT 0,
  eta_mins             INT NOT NULL DEFAULT 30,
  cost_for_two         INT NOT NULL DEFAULT 400,
  area                 VARCHAR(120) NOT NULL DEFAULT '',
  price_tier           TINYINT NOT NULL DEFAULT 2,
  distance_km          DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  veg                  TINYINT(1) NOT NULL DEFAULT 0,
  offer                VARCHAR(120) DEFAULT NULL,
  is_open              TINYINT(1) NOT NULL DEFAULT 1,
  opens_at             VARCHAR(10) DEFAULT NULL,
  closes_at            VARCHAR(10) DEFAULT NULL,
  status               ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  is_blocked           TINYINT(1) NOT NULL DEFAULT 0,
  rejection_reason     TEXT DEFAULT NULL,
  onboarding_step      TINYINT NOT NULL DEFAULT 1,
  commission_rate      DECIMAL(5,2) NOT NULL DEFAULT 22,
  owner_name           VARCHAR(120) NOT NULL DEFAULT '',
  owner_email          VARCHAR(160) NOT NULL DEFAULT '',
  owner_phone          VARCHAR(20)  NOT NULL DEFAULT '',
  fssai_number         VARCHAR(40)  NOT NULL DEFAULT '',
  fssai_doc_url        TEXT NOT NULL,
  fssai_expiry         DATE DEFAULT NULL,
  pan_number           VARCHAR(20)  NOT NULL DEFAULT '',
  pan_doc_url          TEXT NOT NULL,
  gst_number           VARCHAR(20)  DEFAULT NULL,
  gst_doc_url          TEXT DEFAULT NULL,
  shop_license_doc_url TEXT NOT NULL,
  bank_account_name    VARCHAR(120) NOT NULL DEFAULT '',
  bank_account_number  VARCHAR(40)  NOT NULL DEFAULT '',
  bank_ifsc            VARCHAR(20)  NOT NULL DEFAULT '',
  bank_proof_url       TEXT NOT NULL,
  agreement_accepted_at TIMESTAMP NULL DEFAULT NULL,
  agreement_signature  VARCHAR(160) DEFAULT NULL,
  agreement_version    VARCHAR(20)  DEFAULT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_owner (owner_id),
  INDEX idx_status (status),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_outlets (
  id            CHAR(36) PRIMARY KEY,
  restaurant_id CHAR(36) NOT NULL,
  name          VARCHAR(160) NOT NULL,
  address       VARCHAR(255) NOT NULL DEFAULT '',
  area          VARCHAR(120) NOT NULL DEFAULT '',
  pincode       VARCHAR(12)  NOT NULL DEFAULT '',
  lat           DECIMAL(10,7) DEFAULT NULL,
  lng           DECIMAL(10,7) DEFAULT NULL,
  eta_mins      INT NOT NULL DEFAULT 30,
  is_open       TINYINT(1) NOT NULL DEFAULT 1,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurant (restaurant_id),
  FOREIGN KEY (restaurant_id) REFERENCES partner_restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_outlet_managers (
  id            CHAR(36) PRIMARY KEY,
  restaurant_id CHAR(36) NOT NULL,
  outlet_id     CHAR(36) NOT NULL,
  user_id       CHAR(36) NOT NULL,
  role          VARCHAR(40) NOT NULL DEFAULT 'manager',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_outlet_user (outlet_id, user_id),
  INDEX idx_user (user_id),
  INDEX idx_restaurant (restaurant_id),
  FOREIGN KEY (outlet_id) REFERENCES partner_outlets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_dishes (
  id             CHAR(36) PRIMARY KEY,
  restaurant_id  CHAR(36) NOT NULL,
  outlet_id      CHAR(36) DEFAULT NULL,
  name           VARCHAR(160) NOT NULL,
  description    VARCHAR(500) NOT NULL DEFAULT '',
  image          TEXT NOT NULL,
  section        VARCHAR(80) NOT NULL DEFAULT 'Mains',
  price          INT NOT NULL,
  mrp            INT DEFAULT NULL,
  rating         DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  veg            TINYINT(1) NOT NULL DEFAULT 1,
  spicy          TINYINT(1) NOT NULL DEFAULT 0,
  bestseller     TINYINT(1) NOT NULL DEFAULT 0,
  in_stock       TINYINT(1) NOT NULL DEFAULT 1,
  available_days VARCHAR(40) NOT NULL DEFAULT '0,1,2,3,4,5,6',
  available_from VARCHAR(8)  NOT NULL DEFAULT '00:00',
  available_to   VARCHAR(8)  NOT NULL DEFAULT '23:59',
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_outlet (outlet_id),
  FOREIGN KEY (restaurant_id) REFERENCES partner_restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_dish_variants (
  id         CHAR(36) PRIMARY KEY,
  dish_id    CHAR(36) NOT NULL,
  name       VARCHAR(80) NOT NULL,
  price      INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dish (dish_id),
  FOREIGN KEY (dish_id) REFERENCES partner_dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS partner_dish_addons (
  id         CHAR(36) PRIMARY KEY,
  dish_id    CHAR(36) NOT NULL,
  name       VARCHAR(80) NOT NULL,
  price      INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dish (dish_id),
  FOREIGN KEY (dish_id) REFERENCES partner_dishes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Marketing / ops
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id         CHAR(36) PRIMARY KEY,
  title      VARCHAR(160) NOT NULL,
  subtitle   VARCHAR(255) NOT NULL DEFAULT '',
  cta_label  VARCHAR(60)  NOT NULL DEFAULT 'Shop now',
  link_to    VARCHAR(255) NOT NULL DEFAULT '/',
  bg         VARCHAR(400) NOT NULL,
  fg         VARCHAR(80)  NOT NULL,
  image      VARCHAR(400) NOT NULL DEFAULT '',
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS riders (
  id         CHAR(36) PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  vehicle    VARCHAR(40)  NOT NULL DEFAULT 'bike',
  vehicle_no VARCHAR(40)  NOT NULL DEFAULT '',
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  notes      TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_assignments (
  id            CHAR(36) PRIMARY KEY,
  order_id      CHAR(36) NOT NULL,
  rider_id      CHAR(36) NOT NULL,
  status        ENUM('assigned','picked_up','delivered','cancelled') NOT NULL DEFAULT 'assigned',
  assigned_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  picked_up_at  TIMESTAMP NULL DEFAULT NULL,
  delivered_at  TIMESTAMP NULL DEFAULT NULL,
  notes         TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_order (order_id),
  INDEX idx_rider (rider_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refund_requests (
  id         CHAR(36) PRIMARY KEY,
  order_id   CHAR(36) NOT NULL,
  user_id    CHAR(36) NOT NULL,
  reason     VARCHAR(120) NOT NULL,
  details    TEXT NOT NULL,
  amount     INT NOT NULL DEFAULT 0,
  status     ENUM('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  admin_note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  INDEX idx_user (user_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id          CHAR(36) PRIMARY KEY,
  coupon_id   CHAR(36) NOT NULL,
  user_id     CHAR(36) NOT NULL,
  order_id    CHAR(36) DEFAULT NULL,
  discount    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ALTER orders to support warehouse / outlet / restaurant / razorpay
-- (MySQL 8 supports IF NOT EXISTS on ADD COLUMN; if you're on 5.7, drop
--  the IF NOT EXISTS clauses below and run only what's missing.)
-- ============================================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS warehouse_id       CHAR(36) DEFAULT NULL AFTER restaurant_id,
  ADD COLUMN IF NOT EXISTS outlet_id          CHAR(36) DEFAULT NULL AFTER warehouse_id,
  ADD COLUMN IF NOT EXISTS razorpay_order_id  VARCHAR(80) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(80) DEFAULT NULL,
  ADD INDEX IF NOT EXISTS idx_orders_warehouse (warehouse_id),
  ADD INDEX IF NOT EXISTS idx_orders_outlet (outlet_id);

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- HOW TO GRANT YOURSELF ADMIN
-- ============================================================
-- 1. Find your user id:    SELECT id, email FROM users;
-- 2. Insert the admin row: replace <USER_ID_HERE> with your id.
--
--   INSERT INTO user_roles (id, user_id, role)
--   VALUES (UUID(), '<USER_ID_HERE>', 'admin');
--
