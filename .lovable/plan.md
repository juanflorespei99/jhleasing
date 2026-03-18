

## Fix: Serial Number (VIN) Not Reaching HubSpot

### Root Cause
Two problems are preventing the VIN from arriving at HubSpot:

1. **Column-level grant blocks VIN for anonymous users**: The recent security migration revoked blanket SELECT on `vehicles` from `anon` and only granted safe columns — `vin` was excluded. So when an unauthenticated user visits `/solicitar-compra/:slug`, the query `select("name, vin, ...")` fails or returns `null` for `vin`.

2. **Fragile injection strategies**: The multi-strategy DOM injection (jQuery, iframe, parent DOM) can silently fail if HubSpot renders the form differently. There's no guaranteed fallback.

### Solution

**Step 1 — Database function to fetch VIN securely**

Create a `SECURITY DEFINER` function `get_vehicle_vin(_slug text)` that returns the VIN for a given slug. This avoids granting `vin` column access to anon while still allowing the purchase form to obtain it.

```sql
CREATE OR REPLACE FUNCTION public.get_vehicle_vin(_slug text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vin FROM vehicles WHERE slug = _slug AND is_active = true LIMIT 1;
$$;
```

**Step 2 — Update PurchaseRequest.tsx**

- Fetch VIN via RPC (`supabase.rpc("get_vehicle_vin", { _slug: slug })`) instead of selecting it from the vehicles table directly
- Remove `vin` from the main vehicle query (keep `name, img, year, price_public`)
- Keep all existing injection strategies but also add `onFormSubmit` with a forced re-injection that covers **all** strategies (not just jQuery), ensuring the VIN is set right before submission regardless of prior attempts

**Step 3 — Update Supabase types**

Add `get_vehicle_vin` function signature to `types.ts`.

### Files Changed
- New migration: `get_vehicle_vin` function
- `src/pages/PurchaseRequest.tsx` — fetch VIN via RPC, strengthen `onFormSubmit` fallback
- `src/integrations/supabase/types.ts` — add function type

