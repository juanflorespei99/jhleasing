
-- Allow anon to read public+active vehicles through the view
CREATE POLICY "Public can read public active vehicles"
  ON public.vehicles
  FOR SELECT
  TO anon
  USING (is_public = true AND is_active = true AND (release_at_public IS NULL OR release_at_public <= now()));
