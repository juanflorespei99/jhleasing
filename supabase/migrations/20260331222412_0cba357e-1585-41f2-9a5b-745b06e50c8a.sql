
-- Fix 1: Protect user_roles from privilege escalation
-- Deny all INSERT/UPDATE/DELETE for non-admin users
CREATE POLICY "Only admins can insert user_roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user_roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user_roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 2: Restrict vehicles SELECT to admins only (employees use views)
DROP POLICY IF EXISTS "All authenticated users see all vehicles" ON public.vehicles;

CREATE POLICY "Only admins can select all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Create employee view that excludes sensitive sale data
CREATE OR REPLACE VIEW public.vehicles_employee
WITH (security_invoker = on) AS
SELECT id, slug, brand, name, type, year, price_public, price_employee, mileage,
       img, images, status, location, description, is_public, is_armored, is_active,
       color, plate_state, vin, created_at, release_at_public, created_by
FROM public.vehicles
WHERE is_active = true AND status != 'Vendido';

-- Fix 4: Fix get_vehicle_vin search_path (supabase linter warning)
CREATE OR REPLACE FUNCTION public.get_vehicle_vin(_slug text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT vin FROM vehicles WHERE slug = _slug LIMIT 1;
$$;
