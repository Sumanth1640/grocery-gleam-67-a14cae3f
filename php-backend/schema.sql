-- MySQL schema for Phase 1 PHP backend
-- Run in phpMyAdmin: create DB `grocery_app`, then import this file.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- users ----------
CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36) PRIMARY KEY,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name    VARCHAR(120) DEFAULT NULL,
  phone        VARCHAR(20)  DEFAULT NULL,
  avatar_url   TEXT         DEFAULT NULL,
  is_blocked   TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- addresses ----------
CREATE TABLE IF NOT EXISTS addresses (
  id          CHAR(36) PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  full_name   VARCHAR(80)  NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  line1       VARCHAR(160) NOT NULL,
  line2       VARCHAR(160) DEFAULT NULL,
  city        VARCHAR(60)  NOT NULL,
  pincode     VARCHAR(10)  NOT NULL,
  type        ENUM('Home','Work','Other') NOT NULL DEFAULT 'Home',
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id          CHAR(36) PRIMARY KEY,
  slug        VARCHAR(60) NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  image       TEXT NOT NULL,
  tint        VARCHAR(60) NOT NULL DEFAULT '#e8f5e9',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- products ----------
CREATE TABLE IF NOT EXISTS products (
  id            CHAR(36) PRIMARY KEY,
  slug          VARCHAR(80) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  category_slug VARCHAR(60) NOT NULL,
  image         TEXT NOT NULL,
  weight        VARCHAR(40) NOT NULL,
  price         INT NOT NULL,
  mrp           INT NOT NULL,
  eta           VARCHAR(40) NOT NULL DEFAULT '11 mins',
  rating        DECIMAL(2,1) NOT NULL DEFAULT 4.5,
  in_stock      TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (category_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
  id              CHAR(36) PRIMARY KEY,
  user_id         CHAR(36) NOT NULL,
  items           JSON NOT NULL,       -- [{ product:{...}, qty:n }]
  address         JSON NOT NULL,
  payment         ENUM('upi','card','cod') NOT NULL,
  subtotal        INT NOT NULL,
  delivery        INT NOT NULL DEFAULT 0,
  total           INT NOT NULL,
  status          ENUM('placed','accepted','preparing','out_for_delivery','delivered','cancelled')
                    NOT NULL DEFAULT 'placed',
  payment_status  ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id), INDEX (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed a couple of products so /api/products/list.php returns something
INSERT INTO products (id, slug, name, category_slug, image, weight, price, mrp) VALUES
  (UUID(), 'amul-milk-500ml', 'Amul Gold Milk', 'dairy', 'https://placehold.co/300', '500 ml', 35, 38),
  (UUID(), 'tata-salt-1kg',  'Tata Salt',       'staples', 'https://placehold.co/300', '1 kg', 28, 30)
ON DUPLICATE KEY UPDATE name = VALUES(name);
