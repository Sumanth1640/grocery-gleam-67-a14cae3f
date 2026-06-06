-- ============================================================
-- Wooden Furniture — MySQL schema + seed data
-- Tables: furniture_items, furniture_quotes
-- Run on the same database as the rest of the app.
-- ============================================================

CREATE TABLE IF NOT EXISTS furniture_items (
  id          CHAR(36)        NOT NULL PRIMARY KEY,
  slug        VARCHAR(160)    NOT NULL UNIQUE,
  name        VARCHAR(255)    NOT NULL,
  category    VARCHAR(64)     NOT NULL,
  wood        VARCHAR(64)     NOT NULL,
  price       DECIMAL(12,2)   NOT NULL,
  mrp         DECIMAL(12,2)   NOT NULL,
  image       VARCHAR(1024)   NOT NULL,
  blurb       TEXT            NULL,
  dimensions  VARCHAR(160)    NULL,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  sort_order  INT             NOT NULL DEFAULT 0,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_active   (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS furniture_quotes (
  id           CHAR(36)       NOT NULL PRIMARY KEY,
  user_id      CHAR(36)       NULL,
  name         VARCHAR(160)   NOT NULL,
  email        VARCHAR(255)   NOT NULL,
  phone        VARCHAR(40)    NULL,
  city         VARCHAR(120)   NULL,
  pincode      VARCHAR(20)    NULL,
  message      TEXT           NULL,
  items        JSON           NOT NULL,
  total        DECIMAL(12,2)  NOT NULL DEFAULT 0,
  status       ENUM('new','contacted','quoted','converted','closed') NOT NULL DEFAULT 'new',
  admin_note   TEXT           NULL,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_user   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Seed: furniture hero slide (table `n` — hero slides)
-- ------------------------------------------------------------
INSERT INTO n (id, badge_text, title_line1, title_highlight, title_line3, description, primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link, image, deal_label, deal_text, is_active, sort_order)
VALUES (UUID(),'Handcrafted · Solid wood','Wooden furniture,','built to last,','delivered to your home.','Teak, sheesham, mango, oak and walnut — handcrafted by artisans, finished by hand.','Shop furniture','/furniture','Browse collection','/furniture','https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop','Limited offer','Up to 30% off select pieces',1,10);

-- ------------------------------------------------------------
-- Seed: 18 pieces across 5 categories
-- ------------------------------------------------------------
INSERT INTO furniture_items (id, slug, name, category, wood, price, mrp, image, blurb, dimensions, sort_order) VALUES
(UUID(),'sheesham-coffee-table','Sheesham Coffee Table','living','Sheesham',8499,12999,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop','Hand-finished solid sheesham with brass inlay.','L 42" x W 24" x H 18"',10),
(UUID(),'teak-3seater-sofa','Teak 3-Seater Sofa','living','Teak',28999,39999,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop','Timeless teak frame with linen upholstery.','L 78" x W 32" x H 34"',20),
(UUID(),'mango-wood-bed','Mango Wood Queen Bed','bedroom','Mango',24999,34999,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop','Chunky mango wood frame with slatted headboard.','L 84" x W 64" x H 42"',30),
(UUID(),'oak-wardrobe','Oak 3-Door Wardrobe','storage','Oak',32499,44999,'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop','Spacious wardrobe with soft-close oak doors.','L 60" x W 22" x H 78"',40),
(UUID(),'sheesham-dining-set','Sheesham 6-Seater Dining Set','dining','Sheesham',38999,54999,'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=800&auto=format&fit=crop','Solid sheesham table with six cushioned chairs.','L 72" x W 36" x H 30"',50),
(UUID(),'walnut-study-desk','Walnut Study Desk','study','Walnut',14499,19999,'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop','Minimal walnut desk with cable channel and drawer.','L 48" x W 24" x H 30"',60),
(UUID(),'teak-bookshelf','Teak Ladder Bookshelf','study','Teak',9999,13999,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop','Five-tier leaning shelf in honey teak finish.','L 24" x W 16" x H 72"',70),
(UUID(),'mango-tv-unit','Mango Wood TV Unit','living','Mango',18999,26999,'https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?w=800&auto=format&fit=crop','Rustic TV console with iron accents.','L 60" x W 16" x H 22"',80),
(UUID(),'oak-nightstand','Oak Bedside Nightstand','bedroom','Oak',5499,7999,'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800&auto=format&fit=crop','Compact two-drawer nightstand in natural oak.','L 18" x W 16" x H 24"',90),
(UUID(),'sheesham-shoe-rack','Sheesham Shoe Rack','storage','Sheesham',6999,9499,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop','Three-tier shoe rack with seating top.','L 36" x W 12" x H 20"',100),
(UUID(),'teak-armchair','Teak Lounge Armchair','living','Teak',12999,17999,'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&auto=format&fit=crop','Sculpted teak armchair with cane back.','L 28" x W 30" x H 34"',110),
(UUID(),'sheesham-king-bed','Sheesham King Bed','bedroom','Sheesham',34999,49999,'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&auto=format&fit=crop','King-size sheesham bed with storage drawers.','L 84" x W 78" x H 44"',120),
(UUID(),'mango-bench','Mango Wood Dining Bench','dining','Mango',7499,10999,'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&auto=format&fit=crop','Rustic mango wood bench, seats three.','L 60" x W 14" x H 18"',130),
(UUID(),'walnut-sideboard','Walnut Sideboard','dining','Walnut',26999,36999,'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&auto=format&fit=crop','Mid-century walnut sideboard with brass legs.','L 66" x W 18" x H 30"',140),
(UUID(),'oak-bookshelf','Oak Wall Bookshelf','study','Oak',11499,15999,'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&auto=format&fit=crop','Floating-style oak shelves, six tiers.','L 36" x W 12" x H 60"',150),
(UUID(),'sheesham-chest','Sheesham Chest of Drawers','bedroom','Sheesham',16999,22999,'https://images.unsplash.com/photo-1616627781807-12a4f44a3e3a?w=800&auto=format&fit=crop','Six-drawer chest with hand-carved details.','L 36" x W 18" x H 44"',160),
(UUID(),'teak-rocking-chair','Teak Rocking Chair','living','Teak',9499,13499,'https://images.unsplash.com/photo-1519961655809-34fa156820fe?w=800&auto=format&fit=crop','Classic teak rocker with woven cane seat.','L 28" x W 38" x H 42"',170),
(UUID(),'mango-bar-cabinet','Mango Wood Bar Cabinet','storage','Mango',21999,29999,'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&auto=format&fit=crop','Stand-up bar cabinet with glass shelves.','L 36" x W 18" x H 60"',180);
