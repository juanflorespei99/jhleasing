import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brandLogos } from "@/data/brands";

interface CustomBrandLogo {
  brand_name: string;
  logo_url: string;
}

/**
 * Fetches custom brand logos from Supabase and merges them with the
 * hardcoded logos from src/data/brands.ts. Hardcoded logos take
 * precedence (they are local SVGs, faster to load).
 *
 * Returns:
 *  - allBrandLogos: merged Record<string, string> (brand → logoUrl)
 *  - customBrands: list of brand names from the DB (for the combobox)
 *  - loading: true while fetching
 *  - refetch: call to re-fetch after a new custom logo is uploaded
 */
export function useCustomBrandLogos() {
  const [customLogos, setCustomLogos] = useState<CustomBrandLogo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomLogos = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("brand_logos")
      .select("brand_name, logo_url");
    if (!error && data) {
      setCustomLogos(data as CustomBrandLogo[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomLogos();
  }, [fetchCustomLogos]);

  // Merge: custom logos first, then hardcoded overrides them for known brands.
  const allBrandLogos: Record<string, string> = {};
  for (const cl of customLogos) {
    allBrandLogos[cl.brand_name] = cl.logo_url;
  }
  // Hardcoded logos override custom ones for the 26 predefined brands.
  Object.assign(allBrandLogos, brandLogos);

  const customBrands = customLogos.map((cl) => cl.brand_name);

  return { allBrandLogos, customBrands, loading, refetch: fetchCustomLogos };
}
