
-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- Allow public read access
CREATE POLICY "Vehicle images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

-- Allow authenticated admins to upload
CREATE POLICY "Admins can upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicle images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicle images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-images' AND has_role(auth.uid(), 'admin'));
