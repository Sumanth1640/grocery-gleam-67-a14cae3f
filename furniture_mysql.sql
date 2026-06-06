-- ============================================================
-- Fully Wooden Furniture — MySQL schema + seed data
-- All images are 100% solid wood — no fabric, cushions, or upholstery.
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
-- Seed: 18 solid-wood pieces across 5 categories
-- ------------------------------------------------------------
INSERT INTO furniture_items (id, slug, name, category, wood, price, mrp, image, blurb, dimensions, sort_order) VALUES
(UUID(),'sheesham-coffee-table','Sheesham Coffee Table','living','Sheesham',8499,12999,'/furniture/sheesham-coffee-table.jpg','Hand-finished solid sheesham — all wood, no fabric.','L 42" x W 24" x H 18"',10),
(UUID(),'teak-side-table','Teak Side Table','living','Teak',6999,9999,'/furniture/teak-dining-table.jpg','Solid teak side table, hand-rubbed oil finish.','L 20" x W 20" x H 24"',20),
(UUID(),'mango-wood-bed','Mango Wood Queen Bed','bedroom','Mango',24999,34999,'/furniture/mango-wood-bed.jpg','Chunky mango wood frame with slatted wooden headboard.','L 84" x W 64" x H 42"',30),
(UUID(),'oak-wardrobe','Oak 3-Door Wardrobe','storage','Oak',32499,44999,'/furniture/oak-wardrobe.jpg','Spacious all-wood wardrobe with soft-close oak doors.','L 60" x W 22" x H 78"',40),
(UUID(),'sheesham-dining-table','Sheesham 6-Seater Dining Table','dining','Sheesham',38999,54999,'/furniture/teak-dining-table.jpg','All-wood sheesham table with six matching wooden chairs.','L 72" x W 36" x H 30"',50),
(UUID(),'walnut-study-desk','Walnut Study Desk','study','Walnut',14499,19999,'/furniture/walnut-study-desk.jpg','Minimal solid walnut desk with cable channel and drawer.','L 48" x W 24" x H 30"',60),
(UUID(),'teak-bookshelf','Teak Ladder Bookshelf','study','Teak',9999,13999,'/furniture/teak-bookshelf.jpg','Five-tier solid teak leaning shelf in honey finish.','L 24" x W 16" x H 72"',70),
(UUID(),'mango-tv-unit','Mango Wood TV Unit','living','Mango',18999,26999,'/furniture/mango-tv-unit.jpg','Rustic all-wood TV console in solid mango.','L 60" x W 16" x H 22"',80),
(UUID(),'oak-nightstand','Oak Bedside Nightstand','bedroom','Oak',5499,7999,'/furniture/oak-nightstand.jpg','Compact two-drawer nightstand in natural solid oak.','L 18" x W 16" x H 24"',90),
(UUID(),'sheesham-shoe-rack','Sheesham Shoe Rack','storage','Sheesham',6999,9499,'/furniture/sheesham-shoe-rack.jpg','Three-tier solid sheesham shoe rack — all wood.','L 36" x W 12" x H 20"',100),
(UUID(),'teak-dining-chair','Teak Dining Chair','dining','Teak',4999,6999,'/furniture/teak-dining-chair.jpg','Sculpted all-wood teak dining chair.','L 18" x W 20" x H 34"',110),
(UUID(),'sheesham-king-bed','Sheesham King Bed','bedroom','Sheesham',34999,49999,'/furniture/sheesham-king-bed.jpg','King-size solid sheesham bed with wooden storage drawers.','L 84" x W 78" x H 44"',120),
(UUID(),'mango-bench','Mango Wood Dining Bench','dining','Mango',7499,10999,'/furniture/mango-bench.jpg','Rustic solid mango wood bench, seats three.','L 60" x W 14" x H 18"',130),
(UUID(),'walnut-sideboard','Walnut Sideboard','dining','Walnut',26999,36999,'/furniture/walnut-sideboard.jpg','Mid-century all-wood walnut sideboard.','L 66" x W 18" x H 30"',140),
(UUID(),'oak-bookshelf','Oak Wall Bookshelf','study','Oak',11499,15999,'/furniture/oak-bookshelf.jpg','Floating-style solid oak shelves, six tiers.','L 36" x W 12" x H 60"',150),
(UUID(),'sheesham-chest','Sheesham Chest of Drawers','bedroom','Sheesham',16999,22999,'/furniture/sheesham-chest.jpg','Six-drawer solid sheesham chest with hand-carved details.','L 36" x W 18" x H 44"',160),
(UUID(),'teak-coffee-table-round','Teak Round Coffee Table','living','Teak',9499,13499,'/furniture/sheesham-coffee-table.jpg','Round all-wood teak coffee table.','D 36" x H 16"',170),
(UUID(),'mango-bar-cabinet','Mango Wood Bar Cabinet','storage','Mango',21999,29999,'/furniture/mango-bar-cabinet.jpg','Stand-up bar cabinet, solid mango wood.','L 36" x W 18" x H 60"',180);
