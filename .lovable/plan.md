

# Plan: Centralizar logos de marcas y agregar las 20+ marcas principales de México

## Situación actual
- Solo hay 6 logos SVG en `src/assets/brands/` (Chevrolet, Hyundai, Nissan, GMC, MG, Dodge)
- El mapeo `brandLogos` está duplicado en 3 archivos: `VehicleFilters.tsx`, `Inventory.tsx`, y `Index.tsx`
- La lista `BRANDS` del admin (`VehicleForm.tsx`) tiene 9 marcas pero no coincide con los logos disponibles
- La lista `brandFilters` está hardcodeada con solo 6 marcas

## Cambios propuestos

### 1. Crear SVGs para las marcas faltantes (~15 nuevos archivos)
Agregar a `src/assets/brands/`:
- `volkswagen.svg`, `toyota.svg`, `honda.svg`, `land-rover.svg`, `audi.svg`, `bmw.svg`, `mercedes.svg`, `chrysler.svg`, `ford.svg`, `chirey.svg`, `mazda.svg`, `volvo.svg`, `kia.svg`, `renault.svg`, `suzuki.svg`, `jac.svg`

Cada SVG será un logo vectorial limpio y simple, monocromático para que funcione con el filtro grayscale existente.

### 2. Crear archivo centralizado `src/data/brands.ts`
Un solo lugar con:
- Lista completa de marcas ordenadas alfabéticamente
- Mapeo `brandLogos: Record<string, string>` con todos los imports
- Exportar `BRANDS` para el admin form y `brandLogos` para los filtros

Esto elimina la duplicación actual en 3 archivos.

### 3. Actualizar los consumidores
- **`VehicleFilters.tsx`**: Importar `brandLogos` desde `@/data/brands`
- **`Inventory.tsx`**: Importar `brandLogos` desde `@/data/brands`
- **`Index.tsx`**: Importar desde `@/data/brands`
- **`VehicleForm.tsx`**: Importar `BRANDS` desde `@/data/brands`

### 4. Hacer `brandFilters` dinámico
En vez de hardcodear las 6 marcas en los filtros, derivarlos de las marcas que realmente existen en el inventario cargado de Supabase. Solo mostrar logos de marcas que tengan al menos un vehículo activo.

## Lista completa de marcas (22)
Audi, BMW, Chevrolet, Chirey, Chrysler, Dodge, Ford, GMC, Honda, Hyundai, JAC, KIA, Land Rover, Mazda, Mercedes, MG, Nissan, Renault, Suzuki, Toyota, Volkswagen, Volvo

## Notas
- No se requieren cambios en la base de datos
- Los logos SVG se crearán con diseños vectoriales simples y reconocibles
- El filtro `grayscale(100%) opacity(0.5)` existente se aplicará automáticamente a los logos inactivos

