DROP VIEW IF EXISTS public.vehicles_employee;
CREATE VIEW public.vehicles_employee WITH (security_invoker = on) AS
SELECT id, slug, brand, name, type, year, price_public, price_employee,
       mileage, img, images, status, location, description,
       is_public, is_armored, is_active, color, plate_state,
       created_at, release_at_public, created_by
FROM vehicles
WHERE is_active = true AND status <> 'Vendido';