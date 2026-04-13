-- Brand logos table: stores custom brand logos uploaded by admins for
-- brands not in the hardcoded catalog (src/data/brands.ts).

CREATE TABLE public.brand_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name text UNIQUE NOT NULL,
  logo_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.brand_logos ENABLE ROW LEVEL SECURITY;

-- Everyone can read brand logos (they appear in public inventory filters).
CREATE POLICY "Brand logos are publicly readable"
  ON public.brand_logos FOR SELECT
  USING (true);

-- Only admins can create/update/delete brand logos.
CREATE POLICY "Admins can insert brand logos"
  ON public.brand_logos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand logos"
  ON public.brand_logos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand logos"
  ON public.brand_logos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.brand_logos TO anon;
GRANT SELECT ON public.brand_logos TO authenticated;

-- Storage bucket for brand logo images (public read, admin write).
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read brand logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-logos'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update brand logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete brand logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-logos'
    AND public.has_role(auth.uid(), 'admin')
  );
