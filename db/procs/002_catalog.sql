-- ============================================================================
-- Catalog read procedures. Re-runnable.
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_categories_list;
DROP PROCEDURE IF EXISTS sp_products_search;
DROP PROCEDURE IF EXISTS sp_product_get;

DELIMITER $$

CREATE PROCEDURE sp_categories_list()
BEGIN
  SELECT id AS Id, name AS Name, slug AS Slug, product_type AS ProductType,
         parent_id AS ParentId, sort_order AS SortOrder
  FROM categories
  ORDER BY product_type, sort_order, name;
END$$

-- Any param NULL = "no filter on this field". p_category_slug matches either the
-- category or the subcategory slug. Result set 1 = the page; result set 2 = Total.
CREATE PROCEDURE sp_products_search(
  IN p_category_slug    VARCHAR(140),
  IN p_subcategory_slug VARCHAR(140),
  IN p_gender           VARCHAR(20),
  IN p_q                VARCHAR(200),
  IN p_status           VARCHAR(20),
  IN p_limit            INT,
  IN p_offset           INT
)
BEGIN
  SELECT p.id AS Id, p.sku AS Sku, p.name AS Name, p.price AS Price,
         p.currency AS Currency, p.gender AS Gender, p.status AS Status,
         b.name AS BrandName, c.name AS CategoryName, s.name AS SubcategoryName,
         (SELECT pi.url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order
          LIMIT 1) AS PrimaryImageUrl
  FROM products p
  LEFT JOIN brands b     ON b.id = p.brand_id
  JOIN categories c      ON c.id = p.category_id
  LEFT JOIN categories s ON s.id = p.subcategory_id
  WHERE (p_status IS NULL OR p.status = p_status)
    AND (p_gender IS NULL OR p.gender = p_gender)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug OR s.slug = p_category_slug)
    AND (p_subcategory_slug IS NULL OR s.slug = p_subcategory_slug)
    AND (p_q IS NULL OR p.name LIKE CONCAT('%', p_q, '%'))
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT p_limit OFFSET p_offset;

  SELECT COUNT(*) AS Total
  FROM products p
  JOIN categories c      ON c.id = p.category_id
  LEFT JOIN categories s ON s.id = p.subcategory_id
  WHERE (p_status IS NULL OR p.status = p_status)
    AND (p_gender IS NULL OR p.gender = p_gender)
    AND (p_category_slug IS NULL OR c.slug = p_category_slug OR s.slug = p_category_slug)
    AND (p_subcategory_slug IS NULL OR s.slug = p_subcategory_slug)
    AND (p_q IS NULL OR p.name LIKE CONCAT('%', p_q, '%'));
END$$

-- Result sets: 1 = head (0 rows if not found), 2 = images, 3 = sizes, 4 = materials.
CREATE PROCEDURE sp_product_get(IN p_id INT)
BEGIN
  SELECT p.id AS Id, p.sku AS Sku, p.name AS Name, p.price AS Price,
         p.currency AS Currency, p.description AS Description,
         p.gender AS Gender, p.status AS Status,
         b.name AS BrandName, c.name AS CategoryName, s.name AS SubcategoryName
  FROM products p
  LEFT JOIN brands b     ON b.id = p.brand_id
  JOIN categories c      ON c.id = p.category_id
  LEFT JOIN categories s ON s.id = p.subcategory_id
  WHERE p.id = p_id;

  SELECT url AS Url, alt_text AS AltText, is_primary AS IsPrimary, sort_order AS SortOrder
  FROM product_images
  WHERE product_id = p_id
  ORDER BY is_primary DESC, sort_order;

  SELECT s.label AS Label, s.size_group AS SizeGroup, ps.stock_qty AS StockQty
  FROM product_sizes ps
  JOIN sizes s ON s.id = ps.size_id
  WHERE ps.product_id = p_id
  ORDER BY s.sort_order, s.label;

  SELECT m.name AS Name
  FROM product_materials pm
  JOIN materials m ON m.id = pm.material_id
  WHERE pm.product_id = p_id
  ORDER BY m.name;
END$$

DELIMITER ;
