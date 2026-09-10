-- ============================================================================
-- store_config + themes procedures. Re-runnable.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_store_config_get;
DROP PROCEDURE IF EXISTS sp_themes_list;
DROP PROCEDURE IF EXISTS sp_store_config_update;

DELIMITER $$

CREATE PROCEDURE sp_store_config_get()
BEGIN
  SELECT sc.store_name         AS StoreName,
         sc.currency           AS Currency,
         sc.active_layout      AS ActiveLayout,
         sc.ai_stylist_enabled AS AiStylistEnabled,
         t.key_name            AS ThemeKey,
         t.name                AS ThemeName,
         t.default_layout      AS ThemeDefaultLayout,
         t.css_variables       AS ThemeCssVariables
  FROM store_config sc
  LEFT JOIN ui_themes t ON t.id = sc.active_theme_id
  WHERE sc.id = 1;
END$$

CREATE PROCEDURE sp_themes_list()
BEGIN
  SELECT id AS Id, key_name AS `Key`, name AS Name, default_layout AS DefaultLayout
  FROM ui_themes
  ORDER BY id;
END$$

-- Change the active theme and/or layout. NULL/'' for a param keeps the current
-- value. Unknown theme key -> SQLSTATE 45000 'unknown_theme'. Writes audit_log.
-- Returns the updated config (same shape as sp_store_config_get).
CREATE PROCEDURE sp_store_config_update(
  IN p_theme_key VARCHAR(40),
  IN p_layout    VARCHAR(32),
  IN p_admin_id  VARCHAR(64)
)
BEGIN
  DECLARE v_theme_id     INT;
  DECLARE v_old_theme_id INT;
  DECLARE v_old_layout   VARCHAR(32);
  DECLARE v_new_layout   VARCHAR(32);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT active_theme_id, active_layout
    INTO v_old_theme_id, v_old_layout
  FROM store_config WHERE id = 1;

  SET v_theme_id = v_old_theme_id;
  IF p_theme_key IS NOT NULL AND p_theme_key <> '' THEN
    SET v_theme_id = NULL;
    SELECT id INTO v_theme_id FROM ui_themes WHERE key_name = p_theme_key;
    IF v_theme_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'unknown_theme';
    END IF;
  END IF;

  SET v_new_layout = COALESCE(NULLIF(p_layout, ''), v_old_layout);

  START TRANSACTION;

  UPDATE store_config
  SET active_theme_id = v_theme_id,
      active_layout   = v_new_layout
  WHERE id = 1;

  INSERT INTO audit_log (admin_id, action, table_name, record_id, old_value, new_value)
  VALUES (
    COALESCE(NULLIF(p_admin_id, ''), 'system'),
    'update_store_config', 'store_config', '1',
    JSON_OBJECT('themeId', v_old_theme_id, 'layout', v_old_layout),
    JSON_OBJECT('themeId', v_theme_id,     'layout', v_new_layout)
  );

  COMMIT;

  CALL sp_store_config_get();
END$$

DELIMITER ;
