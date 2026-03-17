

## Plan: Corregir número de contacto en VehicleDetail

### Problema
En `src/pages/VehicleDetail.tsx` línea 236, el número de contacto dice **"1-800-JH-LEASE"** (ficticio). Debe ser **+52 55 5004 8424**.

### Cambio

**`src/pages/VehicleDetail.tsx`** (línea 236):
- Cambiar `1-800-JH-LEASE` → `+52 55 5004 8424`
- Envolver en un `<a href="tel:+525550048424">` para que sea clickeable

El footer (`FooterSection.tsx`) ya tiene el número correcto, no requiere cambios.

