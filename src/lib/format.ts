import type { VehicleRow } from "@/types/vehicle";

/** Format number with comma separators (e.g., 350,000) */
export const fmt = (n: number): string => n.toLocaleString("en-US");

/** Format number as MXN currency (e.g., $350,000) */
export const fmtMXN = (n: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);

export const getDisplayPrice = (v: VehicleRow, isEmployee: boolean): number =>
  isEmployee && v.price_employee ? v.price_employee : v.price_public;
