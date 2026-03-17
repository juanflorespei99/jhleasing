
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS is_armored boolean NOT NULL DEFAULT false;

-- Recreate the public view to include is_armored
DROP VIEW IF EXISTS public.vehicles_public;
CREATE VIEW public.vehicles_public AS
SELECT id, slug, brand, name, type, year, price_public, mileage, img, images, status, location, description, is_public, is_armored, created_at
FROM public.vehicles
WHERE is_active = true
  AND is_public = true
  AND (release_at_public IS NULL OR release_at_public <= now());
