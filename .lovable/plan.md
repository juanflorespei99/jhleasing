

## Problema actual

"Blindada" es un **tipo de vehículo** en la lista (`TYPES`), pero un vehículo blindado puede ser un Sedán, SUV, Pick-up, etc. Necesitamos separar "blindado" como una etiqueta independiente para que el filtro funcione correctamente.

## Plan de implementación

### 1. Agregar columna `is_armored` a la tabla `vehicles`

Migración SQL:
```sql
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS is_armored boolean NOT NULL DEFAULT false;
```

Actualizar también la vista `vehicles_public` para incluir `is_armored`.

### 2. Actualizar tipos en `src/types/vehicle.ts`

Agregar `is_armored: boolean` a `VehicleRow` y `VehicleAdminRow`.

### 3. Modificar el formulario de alta (`VehicleForm.tsx`)

- Quitar "Blindada" de la lista `TYPES`.
- Agregar un **Switch** de "¿Blindado?" debajo de los toggles existentes (Público / Activo).
- Incluir `is_armored` en el payload de insert/update.

### 4. Actualizar la lógica de filtrado

En `Index.tsx`, `Inventory.tsx` y `VehicleFilters.tsx`:
- Cambiar el filtro "Blindada" para que compare `v.is_armored === true` en lugar de `v.type === "Blindada"`.
- Los demás filtros de tipo (SUV, Sedán, etc.) siguen funcionando por `v.type`.

### 5. Mostrar etiqueta "Blindado" en las tarjetas

Agregar un badge o indicador visual en `VehicleCard.tsx` cuando `is_armored` es `true`.

### Archivos a modificar
- Nueva migración SQL
- `src/types/vehicle.ts`
- `src/components/admin/VehicleForm.tsx`
- `src/pages/Index.tsx`
- `src/pages/Inventory.tsx`
- `src/components/VehicleFilters.tsx`
- `src/components/VehicleCard.tsx`

