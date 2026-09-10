-- ============================================================================
-- E-commerce template - core schema (MySQL 8.x)
-- ============================================================================
-- Design notes:
--   * Categories are a flat lookup table. Products carry TWO direct, indexed
--     foreign keys (category_id + nullable subcategory_id) instead of a
--     recursive tree - "show me all ethnic clothing" is one indexed WHERE,
--     no recursive CTEs. A 3rd level later = one more nullable column.
--   * PII lives only in customer_profiles / addresses. Everything else refers
--     to an internal customers.id. A deletion request touches those two tables.
--   * Every admin write goes through the app's audit helper -> audit_log.
--   * store_config is a single-row table (id = 1) the React app reads on load.
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------------
-- Catalog lookups
-- ---------------------------------------------------------------------------
CREATE TABLE brands (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_brands_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id     INT UNSIGNED NULL,                       -- optional, for admin grouping only
  product_type  ENUM('clothes','accessories','footwear') NOT NULL,
  name          VARCHAR(120) NOT NULL,
  slug          VARCHAR(140) NOT NULL,
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  KEY ix_categories_type (product_type),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE materials (
  id    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name  VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_materials_name (name)
) ENGINE=InnoDB;

CREATE TABLE sizes (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  label       VARCHAR(32) NOT NULL,          -- "S", "M", "XL", "38", "EU 40"
  size_group  VARCHAR(32) NOT NULL DEFAULT 'generic', -- "alpha", "numeric-in", "eu", ...
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sizes_group_label (size_group, label)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku             VARCHAR(64) NOT NULL,
  name            VARCHAR(200) NOT NULL,
  brand_id        INT UNSIGNED NULL,
  category_id     INT UNSIGNED NOT NULL,
  subcategory_id  INT UNSIGNED NULL,
  price           DECIMAL(10,2) NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'INR',
  description     TEXT NULL,
  gender          ENUM('men','women','unisex','kids') NOT NULL DEFAULT 'unisex',
  status          ENUM('draft','active','archived') NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_category (category_id),
  KEY ix_products_subcategory (subcategory_id),
  KEY ix_products_brand (brand_id),
  KEY ix_products_status_gender (status, gender),
  CONSTRAINT fk_products_brand       FOREIGN KEY (brand_id)       REFERENCES brands (id)     ON DELETE SET NULL,
  CONSTRAINT fk_products_category    FOREIGN KEY (category_id)    REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE product_materials (
  product_id   INT UNSIGNED NOT NULL,
  material_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, material_id),
  KEY ix_pm_material (material_id),
  CONSTRAINT fk_pm_product  FOREIGN KEY (product_id)  REFERENCES products (id)  ON DELETE CASCADE,
  CONSTRAINT fk_pm_material FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_sizes (
  product_id  INT UNSIGNED NOT NULL,
  size_id     INT UNSIGNED NOT NULL,
  stock_qty   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, size_id),
  KEY ix_ps_size (size_id),
  CONSTRAINT fk_ps_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_size    FOREIGN KEY (size_id)    REFERENCES sizes (id)    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(200) NULL,
  is_primary  TINYINT(1) NOT NULL DEFAULT 0,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_images_product (product_id, sort_order),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Customers  (internal id everywhere; PII isolated)
-- ---------------------------------------------------------------------------
CREATE TABLE customers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cognito_sub  VARCHAR(64) NOT NULL,          -- Cognito user "sub" claim; no email/name here
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_cognito_sub (cognito_sub)
) ENGINE=InnoDB;

CREATE TABLE customer_profiles (
  customer_id  INT UNSIGNED NOT NULL,
  full_name    VARCHAR(200) NULL,             -- PII - candidate for KMS column encryption
  phone        VARCHAR(32) NULL,              -- PII
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  CONSTRAINT fk_profiles_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE addresses (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id  INT UNSIGNED NOT NULL,
  line1        VARCHAR(200) NOT NULL,         -- PII
  line2        VARCHAR(200) NULL,
  city         VARCHAR(120) NOT NULL,
  state        VARCHAR(120) NOT NULL,
  postal_code  VARCHAR(20) NOT NULL,
  country      CHAR(2) NOT NULL DEFAULT 'IN',
  is_default   TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_addresses_customer (customer_id),
  CONSTRAINT fk_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Cart + orders
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id    INT UNSIGNED NULL,           -- NULL = guest cart keyed by session_token
  session_token  CHAR(36) NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_carts_customer (customer_id),
  KEY ix_carts_session (session_token),
  CONSTRAINT fk_carts_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id     INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  size_id     INT UNSIGNED NULL,
  qty         INT NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_line (cart_id, product_id, size_id),
  KEY ix_cart_items_product (product_id),
  CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES carts (id)    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_size    FOREIGN KEY (size_id)    REFERENCES sizes (id)    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE orders (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id  INT UNSIGNED NOT NULL,
  status       ENUM('pending','paid','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  subtotal     DECIMAL(10,2) NOT NULL,
  shipping     DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax          DECIMAL(10,2) NOT NULL DEFAULT 0,
  total        DECIMAL(10,2) NOT NULL,
  currency     CHAR(3) NOT NULL DEFAULT 'INR',
  placed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_orders_customer (customer_id, placed_at),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  size_id     INT UNSIGNED NULL,
  qty         INT NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,         -- price snapshot at purchase time
  PRIMARY KEY (id),
  KEY ix_order_items_order (order_id),
  KEY ix_order_items_product (product_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders (id)   ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
  CONSTRAINT fk_order_items_size    FOREIGN KEY (size_id)    REFERENCES sizes (id)    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id   INT UNSIGNED NOT NULL,
  customer_id  INT UNSIGNED NOT NULL,
  rating       TINYINT UNSIGNED NOT NULL,     -- 1..5 (enforced in app / CHECK below)
  body         TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_reviews_product_customer (product_id, customer_id),
  KEY ix_reviews_product (product_id),
  CONSTRAINT fk_reviews_product  FOREIGN KEY (product_id)  REFERENCES products (id)  ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- AI stylist  (opt-in, sensitive - own table, deletable independently)
-- ---------------------------------------------------------------------------
CREATE TABLE style_profiles (
  customer_id     INT UNSIGNED NOT NULL,
  body_shape      ENUM('hourglass','pear','rectangle','apple','inverted_triangle') NULL,
  color_season    ENUM('warm_spring','warm_autumn','cool_summer','cool_winter','neutral') NULL,
  skin_undertone  ENUM('warm','cool','neutral','olive') NULL,
  style_prefs     JSON NULL,                  -- {"formality":"casual","ethnic_western":0.4,...}
  consented_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  CONSTRAINT fk_style_profiles_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Store configuration + theming  (admin-only writes)
-- ---------------------------------------------------------------------------
CREATE TABLE ui_themes (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  key_name       VARCHAR(40) NOT NULL,        -- stable slug the frontend maps to a CSS file, e.g. "lavender-mist"
  name           VARCHAR(80) NOT NULL,        -- human label for the admin / template picker
  css_variables  JSON NOT NULL,               -- optional per-store overrides merged on top of the CSS file
  default_layout VARCHAR(32) NOT NULL DEFAULT 'grid',  -- suggested list layout for this theme (advisory)
  PRIMARY KEY (id),
  UNIQUE KEY uq_ui_themes_key (key_name),
  UNIQUE KEY uq_ui_themes_name (name)
) ENGINE=InnoDB;

CREATE TABLE store_config (
  id                 TINYINT UNSIGNED NOT NULL DEFAULT 1,
  store_name         VARCHAR(120) NOT NULL DEFAULT 'My Store',
  currency           CHAR(3) NOT NULL DEFAULT 'INR',
  active_theme_id    INT UNSIGNED NULL,
  active_layout      VARCHAR(32) NOT NULL DEFAULT 'grid',   -- frontend maps to a product-list layout component

  ai_stylist_enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_store_config_singleton CHECK (id = 1),
  CONSTRAINT fk_store_config_theme FOREIGN KEY (active_theme_id) REFERENCES ui_themes (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Audit log  (every admin-panel write logs here before commit)
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id    VARCHAR(64) NOT NULL,           -- Cognito sub of the admin
  action      VARCHAR(60) NOT NULL,           -- "update_price", "change_theme", ...
  table_name  VARCHAR(64) NOT NULL,
  record_id   VARCHAR(64) NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_audit_table_record (table_name, record_id),
  KEY ix_audit_created (created_at)
) ENGINE=InnoDB;
