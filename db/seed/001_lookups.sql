-- ============================================================================
-- Seed data: lookup tables (brands, categories, materials, sizes)
-- Safe to re-run: uses INSERT ... ON DUPLICATE KEY UPDATE.
-- This is example data for local development - real catalogs come from CSV import.
-- ============================================================================

INSERT INTO brands (name, slug) VALUES
  ('House Label', 'house-label'),
  ('Generic', 'generic')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Top-level categories (one per product_type) + a few example subcategories.
INSERT INTO categories (id, parent_id, product_type, name, slug, sort_order) VALUES
  (1, NULL, 'clothes',     'Clothing',     'clothing',      1),
  (2, NULL, 'accessories', 'Accessories',  'accessories',   2),
  (3, NULL, 'footwear',    'Footwear',     'footwear',      3),
  (10, 1,   'clothes',     'Western',      'western',       1),
  (11, 1,   'clothes',     'Ethnic',       'ethnic',        2),
  (12, 2,   'accessories', 'Jewellery',    'jewellery',     1),
  (13, 2,   'accessories', 'Bags',         'bags',          2),
  (14, 3,   'footwear',    'Sneakers',     'sneakers',      1),
  (15, 3,   'footwear',    'Sandals',      'sandals',       2)
ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order);

INSERT INTO materials (name) VALUES
  ('Cotton'), ('Linen'), ('Silk'), ('Polyester'), ('Denim'),
  ('Leather'), ('Wool'), ('Rayon'), ('Nylon')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO sizes (label, size_group, sort_order) VALUES
  ('XS', 'alpha', 1), ('S', 'alpha', 2), ('M', 'alpha', 3),
  ('L', 'alpha', 4), ('XL', 'alpha', 5), ('XXL', 'alpha', 6),
  ('UK 4', 'footwear-uk', 1), ('UK 5', 'footwear-uk', 2), ('UK 6', 'footwear-uk', 3),
  ('UK 7', 'footwear-uk', 4), ('UK 8', 'footwear-uk', 5), ('UK 9', 'footwear-uk', 6),
  ('One Size', 'generic', 1)
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);
