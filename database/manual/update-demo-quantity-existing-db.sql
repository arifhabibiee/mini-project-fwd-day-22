-- OPTIONAL, manual command for an EXISTING local demo database.
-- Does not run automatically. Overwrites simulated max/order and stock for MW75 TUMI.
-- Do not run on a production database or real inventory.
BEGIN;
UPDATE public.products
SET max_per_order = NULL
WHERE slug = 'mw75-tumi';

UPDATE public.product_variants AS v
SET stock_quantity = CASE v.color_code
  WHEN 'black' THEN 5
  WHEN 'silver' THEN 10
  ELSE v.stock_quantity
END
FROM public.products AS p
WHERE v.product_id = p.id
  AND p.slug = 'mw75-tumi'
  AND v.color_code IN ('black', 'silver');
COMMIT;
