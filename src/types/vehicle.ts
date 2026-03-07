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
}

/** Admin-specific vehicle row with all fields */
export interface VehicleAdminRow extends VehicleRow {
  price_employee: number;
  vin: string;
  is_active: boolean;
  release_at_public: string | null;
  created_at: string;
  created_by: string | null;
}

/** Format number with comma separators */
export const fmt = (n: number) => n.toLocaleString("en-US");
