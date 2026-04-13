/** Shared vehicle type used across the application */
export interface VehicleRow {
  id: string;
  slug: string;
  brand: string;
  name: string;
  type: string;
  year: number;
  price_public: number;
  price_employee?: number;
  mileage: string;
  img: string;
  images: string[];
  status: string;
  vin?: string;
  location: string;
  description: string;
  is_public: boolean;
  is_armored: boolean;
  color: string;
  plate_state: string;
}

/** Admin-specific vehicle row with all fields */
export interface VehicleAdminRow extends VehicleRow {
  price_employee: number;
  vin: string;
  is_active: boolean;
  is_armored: boolean;
  color: string;
  plate_state: string;
  release_at_public: string | null;
  created_at: string;
  created_by: string | null;
  sold_at: string | null;
  sold_price: number | null;
  buyer_name: string;
  sale_notes: string;
}

/** Re-export formatting utilities for backward compatibility. */
export { fmt, fmtMXN, getDisplayPrice } from "@/lib/format";
