-- ============================================================================
-- Product import procedure. Re-runnable.
--
-- One product row per call, in a single transaction. Idempotent on `sku`.
-- The caller (ProductImportService) has already uploaded images and built the
-- JSON args. Child rows (materials / sizes / images) are replaced wholesale.
-- Returns one row: Id, Action ('inserted' | 'updated').
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_product_import;

DELIMITER $$

CREATE PROCEDURE sp_product_import(
  IN p_sku          VARCHAR(64),
  IN p_name         VARCHAR(200),
  IN p_brand        VARCHAR(120),
  IN p_category     VARCHAR(120),
  IN p_subcategory  VARCHAR(120),
  IN p_product_type VARCHAR(20),
  IN p_price        DECIMAL(10,2),
  IN p_currency     CHAR(3),
  IN p_description  TEXT,
  IN p_gender       VARCHAR(20),
  IN p_status       VARCHAR(20),
  IN p_materials    JSON,   -- ["Cotton","Linen"]
  IN p_sizes        JSON,   -- [{"label":"S","stock":5}]
  IN p_images       JSON    -- [{"url":"...","isPrimary":true,"sortOrder":0}]
)
BEGIN
  DECLARE v_brand_id       INT DEFAULT NULL;
  DECLARE v_category_id    INT DEFAULT NULL;
  DECLARE v_subcategory_id INT DEFAULT NULL;
  DECLARE v_product_id     INT DEFAULT NULL;
  DECLARE v_existed        TINYINT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF p_brand IS NOT NULL AND p_brand <> '' THEN
    INSERT INTO brands (name, slug) VALUES (p_brand, fn_slugify(p_brand))
    ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name);
    SET v_brand_id = LAST_INSERT_ID();
  END IF;

  INSERT INTO categories (name, slug, product_type, parent_id)
  VALUES (p_category, fn_slugify(p_category), p_product_type, NULL)
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name);
  SET v_category_id = LAST_INSERT_ID();

  IF p_subcategory IS NOT NULL AND p_subcategory <> '' THEN
    INSERT INTO categories (name, slug, product_type, parent_id)
    VALUES (p_subcategory, fn_slugify(p_subcategory), p_product_type, v_category_id)
    ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), name = VALUES(name),
                            parent_id = VALUES(parent_id);
    SET v_subcategory_id = LAST_INSERT_ID();
  END IF;

  SELECT id INTO v_product_id FROM products WHERE sku = p_sku;
  SET v_existed = (v_product_id IS NOT NULL);

  INSERT INTO products
    (sku, name, brand_id, category_id, subcategory_id, price, currency,
     description, gender, status)
  VALUES
    (p_sku, p_name, v_brand_id, v_category_id, v_subcategory_id, p_price,
     COALESCE(NULLIF(p_currency, ''), 'INR'), NULLIF(p_description, ''),
     COALESCE(NULLIF(p_gender, ''), 'unisex'), COALESCE(NULLIF(p_status, ''), 'draft'))
  ON DUPLICATE KEY UPDATE
     id = LAST_INSERT_ID(id),
     name = VALUES(name), brand_id = VALUES(brand_id),
     category_id = VALUES(category_id), subcategory_id = VALUES(subcategory_id),
     price = VALUES(price), currency = VALUES(currency),
     description = VALUES(description), gender = VALUES(gender), status = VALUES(status);
  SET v_product_id = LAST_INSERT_ID();

  -- Materials
  DELETE FROM product_materials WHERE product_id = v_product_id;
  IF p_materials IS NOT NULL AND JSON_LENGTH(p_materials) > 0 THEN
    INSERT IGNORE INTO materials (name)
      SELECT jt.name
      FROM JSON_TABLE(p_materials, '$[*]' COLUMNS (name VARCHAR(80) PATH '$')) jt
      WHERE jt.name IS NOT NULL AND jt.name <> '';
    INSERT IGNORE INTO product_materials (product_id, material_id)
      SELECT v_product_id, m.id
      FROM JSON_TABLE(p_materials, '$[*]' COLUMNS (name VARCHAR(80) PATH '$')) jt
      JOIN materials m ON m.name = jt.name;
  END IF;

  -- Sizes
  DELETE FROM product_sizes WHERE product_id = v_product_id;
  IF p_sizes IS NOT NULL AND JSON_LENGTH(p_sizes) > 0 THEN
    INSERT INTO sizes (label, size_group, sort_order)
      SELECT DISTINCT jt.label, 'imported', 99
      FROM JSON_TABLE(p_sizes, '$[*]' COLUMNS (label VARCHAR(32) PATH '$.label')) jt
      WHERE jt.label IS NOT NULL AND jt.label <> ''
        AND NOT EXISTS (SELECT 1 FROM sizes s WHERE s.label = jt.label);
    INSERT INTO product_sizes (product_id, size_id, stock_qty)
      SELECT v_product_id,
             (SELECT id FROM sizes WHERE label = jt.label ORDER BY id LIMIT 1),
             COALESCE(jt.stock, 0)
      FROM JSON_TABLE(p_sizes, '$[*]' COLUMNS (
             label VARCHAR(32) PATH '$.label',
             stock INT PATH '$.stock')) jt
      WHERE jt.label IS NOT NULL AND jt.label <> '';
  END IF;

  -- Images
  DELETE FROM product_images WHERE product_id = v_product_id;
  IF p_images IS NOT NULL AND JSON_LENGTH(p_images) > 0 THEN
    INSERT INTO product_images (product_id, url, is_primary, sort_order)
      SELECT v_product_id, jt.url,
             COALESCE(jt.is_primary, 0), COALESCE(jt.sort_order, 0)
      FROM JSON_TABLE(p_images, '$[*]' COLUMNS (
             url        VARCHAR(500) PATH '$.url',
             is_primary TINYINT      PATH '$.isPrimary',
             sort_order SMALLINT     PATH '$.sortOrder')) jt
      WHERE jt.url IS NOT NULL AND jt.url <> '';
  END IF;

  COMMIT;

  SELECT v_product_id AS Id, IF(v_existed, 'updated', 'inserted') AS Action;
END$$

DELIMITER ;
