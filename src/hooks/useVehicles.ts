import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { VehicleRow } from "@/types/vehicle";
import { withVehicleImageFallback } from "@/lib/vehicleImages";

/** Shared hook for fetching vehicles from Supabase. */
export function useVehicles(isEmployee: boolean, isLoading: boolean) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const query = isEmployee
        ? supabase.from("vehicles_employee").select("*").order("created_at", { ascending: false })
        : supabase.from("vehicles_public").select("*").order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      const rows = ((data as VehicleRow[] | null) ?? []).map((vehicle) => withVehicleImageFallback(vehicle));
      setVehicles(rows);
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
