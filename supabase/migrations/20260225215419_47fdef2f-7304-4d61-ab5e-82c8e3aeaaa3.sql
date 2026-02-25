
-- Step 1: Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'user');

-- Step 2: Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: RLS policy for user_roles (users can read their own roles)
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Step 5: Create allowed_domains table
CREATE TABLE public.allowed_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;

-- Only admins can manage allowed_domains
CREATE POLICY "Admins can manage allowed_domains"
  ON public.allowed_domains FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Create vehicles table
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  brand text NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  year integer NOT NULL,
  price_public integer NOT NULL,
  price_employee integer NOT NULL,
  mileage text NOT NULL DEFAULT '',
  img text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Disponible',
  vin text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Public users see only public vehicles
CREATE POLICY "Public vehicles visible to everyone"
  ON public.vehicles FOR SELECT
  USING (is_public = true);

-- Employees/admins see ALL vehicles
CREATE POLICY "Employees see all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'employee')
    OR public.has_role(auth.uid(), 'admin')
  );

-- Step 7: Create vehicles_public view (excludes sensitive fields)
CREATE VIEW public.vehicles_public
WITH (security_invoker = on) AS
  SELECT id, slug, brand, name, type, year, price_public, mileage, img, images, status, location, description, is_public, created_at
  FROM public.vehicles;
