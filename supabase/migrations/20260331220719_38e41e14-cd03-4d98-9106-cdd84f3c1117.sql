DROP VIEW IF EXISTS vehicles_public;
CREATE VIEW vehicles_public WITH (security_invoker=on) AS
SELECT id, slug, brand, name, type, year, price_public, mileage, img, images, status, location, description, is_public, is_armored, color, plate_state, created_at
FROM vehicles
WHERE is_active = true
  AND is_public = true
  AND (release_at_public IS NULL OR release_at_public <= now());