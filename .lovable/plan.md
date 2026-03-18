

## Fix: Anonymous Users Can Read Sensitive Vehicle Data

### Problem
Migration `20260307032302` granted `SELECT ON public.vehicles TO anon`, allowing unauthenticated API callers to query the raw `vehicles` table and see **all** columns -- including `price_employee`, `vin`, `buyer_name`, `sold_price`, `sale_notes`.

The UI correctly uses `vehicles_public` (which excludes these), but the REST API exposes everything.

A second finding flags `vehicles_public` as a SECURITY DEFINER view (the latest recreation in migration `20260317180121` dropped `security_invoker = on`).

### Solution (single migration)

1. **Revoke full SELECT on `vehicles` from `anon`**
2. **Grant column-level SELECT** on `vehicles` to `anon` -- only the safe columns that `vehicles_public` exposes
3. **Recreate `vehicles_public`** with `SECURITY INVOKER = ON` to fix the second finding
4. **Keep the existing anon RLS policy** -- it still correctly filters rows for the column-level grant

```sql
-- 1. Revoke blanket SELECT
REVOKE SELECT ON public.vehicles FROM anon;

-- 2. Grant only non-sensitive columns
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
```

This fixes both security findings simultaneously:
- Anon can no longer read `price_employee`, `vin`, `buyer_name`, `sold_price`, `sale_notes`, `created_by` via direct API
- The view is no longer SECURITY DEFINER
- No frontend changes needed -- the UI already uses `vehicles_public`

