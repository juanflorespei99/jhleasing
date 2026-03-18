CREATE OR REPLACE FUNCTION public.get_vehicle_vin(_slug text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vin FROM vehicles WHERE slug = _slug AND is_active = true LIMIT 1;
$$;