-- Add sale-related columns to vehicles table
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS sold_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sold_price integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS buyer_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS sale_notes text DEFAULT '';
