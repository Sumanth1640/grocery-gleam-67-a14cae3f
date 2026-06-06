-- Furniture promos (home page hero strips), admin-managed
CREATE TABLE IF NOT EXISTS furniture_promos (
  id           CHAR(36)      NOT NULL PRIMARY KEY,
  eyebrow      VARCHAR(120)  NULL,
  title        VARCHAR(255)  NOT NULL,
  highlight    VARCHAR(255)  NULL,
  blurb        TEXT          NULL,
  cta_label    VARCHAR(80)   NOT NULL DEFAULT 'Explore the collection',
  cta_link     VARCHAR(512)  NOT NULL DEFAULT '/furniture',
  image        VARCHAR(1024) NOT NULL,
  bg_gradient  VARCHAR(512)  NULL,
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order   INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO furniture_promos (id, eyebrow, title, highlight, blurb, cta_label, cta_link, image, bg_gradient, sort_order) VALUES
(UUID(),'Solid wood collection','Handcrafted wooden furniture,','built for life.','Teak, sheesham, mango and oak — shaped by master carpenters, finished by hand.','Explore the collection','/furniture','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&auto=format&fit=crop','linear-gradient(135deg, oklch(0.93 0.04 60) 0%, oklch(0.88 0.06 50) 60%, oklch(0.82 0.08 40) 100%)',10);
