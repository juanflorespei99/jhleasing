import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { VehicleRow } from "@/types/vehicle";

/**
 * Shared hook for fetching vehicles from Supabase.
 * Problem: fetchVehicles was duplicated in Index.tsx, Inventory.tsx, and Compare.tsx
 * with identical logic. useEffect deps included `isLoading` causing double-fetch on mount.
 * Solution: Single hook with stable fetch, correct deps, and toast error handling.
 */
export function useVehicles(isEmployee: boolean, isLoading: boolean) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const query = isEmployee
        ? supabase.from("vehicles").select("*").neq("status", "Vendido").order("created_at", { ascending: false })
        : supabase.from("vehicles_public").select("*").order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setVehicles((data as VehicleRow[]) ?? []);
    } catch {
      toast.error("Error cargando inventario");
    }
    setLoading(false);
  }, [isEmployee]);

  useEffect(() => {
    // Wait until auth has resolved before fetching
    if (isLoading) return;
    fetchVehicles();
  }, [isLoading, fetchVehicles]);

  return { vehicles, loading, refetch: fetchVehicles };
}
