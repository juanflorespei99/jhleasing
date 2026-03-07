
-- Remove the permissive public SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Public vehicles visible to everyone" ON public.vehicles;

-- Revoke direct SELECT from anon and public roles on the vehicles table
REVOKE SELECT ON public.vehicles FROM anon;
REVOKE SELECT ON public.vehicles FROM public;

-- Ensure anon can still read the vehicles_public view (which excludes sensitive columns)
GRANT SELECT ON public.vehicles_public TO anon;
GRANT SELECT ON public.vehicles_public TO public;
