ALTER VIEW public.vehicles_public SET (security_invoker = false);
ALTER VIEW public.vehicles_employee SET (security_invoker = false);

REVOKE ALL ON TABLE public.vehicles_public FROM PUBLIC;
REVOKE ALL ON TABLE public.vehicles_employee FROM PUBLIC;

GRANT SELECT ON TABLE public.vehicles_public TO anon, authenticated;
GRANT SELECT ON TABLE public.vehicles_employee TO authenticated;

REVOKE SELECT ON TABLE public.vehicles FROM PUBLIC;
REVOKE SELECT ON TABLE public.vehicles FROM anon;
GRANT SELECT ON TABLE public.vehicles TO authenticated;