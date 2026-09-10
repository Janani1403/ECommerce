-- ============================================================================
-- Shared SQL functions. Re-runnable (DROP ... IF EXISTS first).
-- ============================================================================

DROP FUNCTION IF EXISTS fn_slugify;

DELIMITER $$

-- Lowercase, non-alphanumeric runs -> single hyphen, trim leading/trailing hyphens.
-- One canonical slug implementation shared by every proc (and matched by the API).
CREATE FUNCTION fn_slugify(p_text VARCHAR(255))
RETURNS VARCHAR(255)
DETERMINISTIC
NO SQL
BEGIN
  DECLARE v VARCHAR(255);
  SET v = LOWER(TRIM(p_text));
  SET v = REGEXP_REPLACE(v, '[^a-z0-9]+', '-');
  SET v = REGEXP_REPLACE(v, '(^-+|-+$)', '');
  RETURN v;
END$$

DELIMITER ;
