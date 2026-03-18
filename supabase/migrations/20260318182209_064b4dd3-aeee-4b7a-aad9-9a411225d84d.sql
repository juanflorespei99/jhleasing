CREATE OR REPLACE FUNCTION public.reserve_vehicle(_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE vehicles
  SET is_public = false,
      status = 'Solicitado'
  WHERE slug = _slug
    AND status = 'Disponible';
END;
$$;