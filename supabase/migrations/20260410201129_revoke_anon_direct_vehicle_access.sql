-- Remove ALL remaining anon access to the vehicles table.
--
-- Context: migration 20260318175016 granted anon a column-level SELECT on
-- a restricted set of columns (excluding price_employee, vin, sold_price,
-- buyer_name, sale_notes, etc.). That was correct and effective — Postgres
-- would reject `SELECT price_employee` from anon. However, it's cleaner to
-- revoke this entirely: anonymous users should only ever read vehicle data
-- through the vehicles_public view, which is a SECURITY DEFINER view that
-- hardcodes exactly which columns and rows are visible.
--
-- After this migration:
--   - anon: can only query vehicles_public (safe columns, public+active rows)
--   - authenticated: can query vehicles_employee (includes price_employee)
--                     AND vehicles table directly (for admin panel, gated by
--                     the admin-only SELECT RLS policy)
--   - The anon RLS policy on vehicles becomes dead code (anon can't reach the
--     table at all), so we drop it for clarity.

-- 1. Revoke the column-level SELECT that was granted to anon in 20260318175016.
REVOKE SELECT (
  id, slug, brand, name, type, year, price_public,
  mileage, img, images, status, location, description,
  is_public, is_armored, is_active, created_at, release_at_public
) ON public.vehicles FROM anon;

-- 2. Drop the anon RLS policy — it's now unreachable (anon has no GRANT).
DROP POLICY IF EXISTS "Public can read public active vehicles" ON public.vehicles;
-- Also drop the earlier variant name in case it exists under a different label.
DROP POLICY IF EXISTS "Allow anonymous users to read public active vehicles" ON public.vehicles;

-- 3. Verify: the remaining policies on vehicles should be:
--    - "Only admins can select all vehicles" (authenticated, SELECT)
--    - "Admins can insert vehicles" (authenticated, INSERT)
--    - "Admins can update vehicles" (authenticated, UPDATE)
--    - "Admins can delete vehicles" (authenticated, DELETE)
--    All requiring admin role via has_role().
--
-- The vehicles_public view (SECURITY DEFINER) handles all anonymous reads.
-- The vehicles_employee view (SECURITY DEFINER) handles authenticated employee reads.
-- Both views are already properly GRANTed (20260406225707):
--    vehicles_public  → anon, authenticated
--    vehicles_employee → authenticated only
