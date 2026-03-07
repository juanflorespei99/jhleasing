
-- The view vehicles_public reads from vehicles, so anon needs SELECT on vehicles.
-- RLS on vehicles will still protect direct access appropriately.
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT ON public.vehicles TO public;
