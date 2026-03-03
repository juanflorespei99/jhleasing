
-- Step 1: Drop existing view first
DROP VIEW IF EXISTS vehicles_public;

-- Step 2: Add new columns
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS release_at_public timestamptz,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Step 3: Admin CRUD policies
CREATE POLICY "Admins can insert vehicles"
  ON vehicles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 4: Recreate view with visibility filters
CREATE VIEW vehicles_public
  WITH (security_invoker = on) AS
  SELECT id, slug, brand, name, type, year, price_public,
         img, images, status, mileage, location, description,
         is_public, created_at
  FROM vehicles
  WHERE is_public = true
    AND is_active = true
    AND (release_at_public IS NULL OR release_at_public <= NOW());

-- Step 5: Insert allowed domains
INSERT INTO allowed_domains (domain) VALUES ('jhl.mx'), ('creditoexpresss.com')
  ON CONFLICT DO NOTHING;
