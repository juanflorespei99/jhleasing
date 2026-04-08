-- Harden vehicle-images storage policies by qualifying has_role() with the
-- public schema. The previous migration (20260226004427) referenced
-- has_role() unqualified, which only works as long as the calling
-- search_path includes the public schema. Storage policies run in a
-- restricted context where this is not guaranteed, so we drop and
-- recreate the policies using public.has_role() explicitly.

DROP POLICY IF EXISTS "Admins can upload vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update vehicle images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete vehicle images" ON storage.objects;

CREATE POLICY "Admins can upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update vehicle images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete vehicle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'admin')
);
