

# Reemplazar vehículos de prueba con inventario real

## Resumen
Se reemplazaran los 6 vehiculos de prueba por los 9 vehiculos reales del archivo Excel "Unidades_en_Venta_1.xlsx". Se usaran imagenes de referencia obtenidas de la web para cada modelo.

## Datos del inventario real

| # | Marca | Modelo | Ano | KM | Ubicacion | Precio Publico | Precio Empleado |
|---|-------|--------|-----|-----|-----------|---------------|-----------------|
| 1 | Chevrolet | Aveo 1.5LS B AT | 2024 | 54,000 | Jalisco | $157,275 | $125,820 |
| 2 | Hyundai | Grand i10 Sedan GL MID | 2026 | 22,000 | Sonora | $200,300 | $160,240 |
| 3 | Nissan | Versa Advance CVT | 2024 | 40,000 | CDMX | $218,650 | $174,920 |
| 4 | GMC | Yukon XL Blindada | 2025 | 38,618 | CDMX | $1,195,700 | $956,560 |
| 5 | GMC | Suburban 4X2 Blindaje | 2015 | 90,000 | Morelos | $320,325 | $256,260 |
| 6 | Chevrolet | Tahoe High Country | 2023 | 87,312 | Morelos | $815,775 | $652,620 |
| 7 | MG | HS Excite TA | 2024 | 70,000 | CDMX | $224,175 | $179,340 |
| 8 | Dodge | Durango Limited | 2017 | 170,000 | CDMX | $227,250 | $181,800 |
| 9 | MG | RX8 SUV Elegance | 2024 | 42,300 | N/A | $339,600 | $271,680 |

## Cambios a realizar

### 1. Actualizar `src/data/vehicles.ts`
- Reemplazar los 6 vehiculos de prueba por los 9 del inventario real
- Usar URLs de imagenes de Wikimedia Commons y otras fuentes libres como imagenes de referencia
- Cada vehiculo tendra una imagen principal y 1-2 imagenes adicionales para la galeria
- Se eliminaran las importaciones de las imagenes locales de prueba (car-tesla.jpg, car-audi.jpg, etc.)
- Se agregara el campo `brand` (marca) para facilitar los filtros
- El precio mostrado sera el precio publico por ahora (el doble pricing se implementara despues)

### 2. Actualizar filtros en `src/pages/Index.tsx`
- **Tipos**: Cambiar de `["Todos", "Sedan", "SUV", "Electrico"]` a `["Todos", "Sedan", "SUV", "Blindada"]` para reflejar las categorias reales
- **Marcas**: Cambiar de `["Tesla", "Audi", "BMW", "VW"]` a `["Chevrolet", "Hyundai", "Nissan", "GMC", "MG", "Dodge"]`
- **Precio maximo**: Ajustar el rango del slider de $100,000 - $1,200,000 para cubrir la Yukon XL ($1,195,700)

### 3. Imagenes
Se usaran URLs publicas de Wikimedia Commons para los modelos disponibles. Para modelos sin imagenes libres disponibles, se usara la misma imagen placeholder del proyecto. Las imagenes se referenciaran como URLs externas en lugar de imports locales.

## Detalles tecnicos
- Se modificaran 2 archivos: `src/data/vehicles.ts` y `src/pages/Index.tsx`
- La interfaz `Vehicle` se mantiene igual, solo se agregan datos reales
- Los archivos de imagen anteriores (car-tesla.jpg, etc.) se dejaran en el proyecto pero no se usaran
- El `VehicleDetail.tsx` no necesita cambios ya que consume los datos de `vehicles.ts`

