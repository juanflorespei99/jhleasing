
DROP POLICY IF EXISTS "Employees see all vehicles" ON public.vehicles;

CREATE POLICY "All authenticated users see all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (true);
