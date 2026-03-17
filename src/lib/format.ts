import type { VehicleRow } from "@/types/vehicle";

/**
 * Problem: Three different formatting functions existed across the codebase:
 * - fmt() in types/vehicle.ts (comma-separated, no currency)
 * - fmtMXN() in VehicleTable, MarkAsSoldDialog, SalesDashboard (MXN currency)
 * - toLocaleString("en-US") inline in PurchaseRequest
 * Solution: Single source of truth for number formatting.
 */

/** Format number with comma separators (e.g., 350,000) */
export const fmt = (n: number): string => n.toLocaleString("en-US");

/** Format number as MXN currency (e.g., $350,000) */
export const fmtMXN = (n: number): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);

/**
 * Problem: displayPrice logic duplicated in Index, Inventory, Compare, MiniCompare.
 * Solution: Single utility function.
 */
export const getDisplayPrice = (v: VehicleRow, isEmployee: boolean): number =>
  isEmployee && v.price_employee ? v.price_employee : v.price_public;
