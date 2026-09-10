-- ============================================================================
-- Seed data: UI themes + the single store_config row.
-- The React app reads store_config on load and applies the active theme's
-- css_variables + active_layout. Only the admin panel writes to these tables.
-- ============================================================================

INSERT INTO ui_themes (id, name, css_variables, layout_type) VALUES
  (1, 'Minimal Light', JSON_OBJECT(
      '--color-bg', '#ffffff',
      '--color-fg', '#111111',
      '--color-accent', '#c8a04a',
      '--font-body', 'Inter, system-ui, sans-serif',
      '--font-display', '"Fraunces", Georgia, serif',
      '--radius', '4px'
   ), 'grid'),
  (2, 'Editorial Dark', JSON_OBJECT(
      '--color-bg', '#0e0e0e',
      '--color-fg', '#f4f1ea',
      '--color-accent', '#d98c5f',
      '--font-body', '"Space Grotesk", system-ui, sans-serif',
      '--font-display', '"Space Grotesk", system-ui, sans-serif',
      '--radius', '0px'
   ), 'masonry')
ON DUPLICATE KEY UPDATE css_variables = VALUES(css_variables), layout_type = VALUES(layout_type);

INSERT INTO store_config (id, store_name, currency, active_theme_id, active_layout, ai_stylist_enabled) VALUES
  (1, 'My Store', 'INR', 1, 'grid', 0)          -- ai_stylist_enabled = 0: code ships, feature stays dark until launch
ON DUPLICATE KEY UPDATE store_name = VALUES(store_name);
