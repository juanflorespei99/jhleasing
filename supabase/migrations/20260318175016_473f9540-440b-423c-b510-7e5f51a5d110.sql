-- 1. Revoke blanket SELECT on vehicles from anon
REVOKE SELECT ON public.vehicles FROM anon;

-- 2. Grant only non-sensitive columns to anon
GRANT SELECT (
  id, slug, brand, name, type, year, price_public,
  mileage, img, images, status, location, description,
  is_public, is_armored, is_active, created_at, release_at_public
) ON public.vehicles TO anon;

-- 3. Recreate view with security_invoker
DROP VIEW IF EXISTS public.vehicles_public;
CREATE VIEW public.vehicles_public
WITH (security_invoker = on) AS
SELECT id, slug, brand, name, type, year, price_public,
       mileage, img, images, status, location, description,
       is_public, is_armored, created_at
FROM public.vehicles
WHERE is_active = true
  AND is_public = true
  AND (release_at_public IS NULL OR release_at_public <= now());

-- 4. Ensure anon can read the view
GRANT SELECT ON public.vehicles_public TO anon;