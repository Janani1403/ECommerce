-- ============================================================================
-- Seed data: UI themes + the single store_config row.
--
-- Each theme's `key_name` maps to a CSS file in the frontend
-- (frontend/src/theme/themes/<key_name>.css). `css_variables` is an optional
-- per-store override object merged on top of that file at runtime - empty here.
-- `active_layout` maps to a product-list layout component
-- (frontend/src/layouts/*). Themes and layouts are chosen independently.
-- Only the admin panel writes to these tables.
-- ============================================================================

INSERT INTO ui_themes (id, key_name, name, css_variables, default_layout) VALUES
  (1, 'lavender-mist',  'Lavender Mist',  JSON_OBJECT(), 'grid'),
  (2, 'peach-sorbet',   'Peach Sorbet',   JSON_OBJECT(), 'masonry'),
  (3, 'sage-mint',      'Sage Mint',      JSON_OBJECT(), 'editorial'),
  (4, 'ombre-dusk',     'Ombré Dusk',     JSON_OBJECT(), 'spotlight'),
  (5, 'porcelain-noir', 'Porcelain Noir', JSON_OBJECT(), 'compact')
ON DUPLICATE KEY UPDATE
  key_name = VALUES(key_name), name = VALUES(name), default_layout = VALUES(default_layout);

INSERT INTO store_config (id, store_name, currency, active_theme_id, active_layout, ai_stylist_enabled) VALUES
  (1, 'Atelier', 'INR', 1, 'grid', 0)      -- ai_stylist_enabled = 0: code ships, feature stays dark until launch
ON DUPLICATE KEY UPDATE store_name = VALUES(store_name);
