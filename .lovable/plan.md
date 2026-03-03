

## Plan: Imagen adaptable con flex-grow

Dos cambios mínimos para que la imagen del vehículo crezca y absorba el espacio vacío:

### 1. `src/components/VehicleCard.tsx`
- Cambiar el contenedor de la imagen de `height: 160px` fijo a `flex-grow` con `min-height: 160px`
- El div de la imagen usará `className="flex-grow"` y `style={{ minHeight: 160 }}` en lugar del height fijo

### 2. `src/pages/Inventory.tsx`
- Agregar `items-stretch` al grid para que todas las tarjetas de una fila tengan la misma altura

Resultado: las tarjetas se igualan en altura y la imagen se expande para llenar cualquier hueco.

