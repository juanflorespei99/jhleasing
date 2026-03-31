
CREATE POLICY "Only admins can insert allowed_domains"
  ON public.allowed_domains FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update allowed_domains"
  ON public.allowed_domains FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete allowed_domains"
  ON public.allowed_domains FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
