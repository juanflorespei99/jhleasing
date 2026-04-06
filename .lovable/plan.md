

## Plan: Actualizar precios y agregar Tucson

### Datos de la imagen

La columna "80%" es el **precio empleado**. El precio público se calcula: `precio_empleado / 0.80` (es decir, ×1.25).

### Actualizaciones a 8 vehículos existentes

| Vehículo | Año actual → nuevo | Emp. actual → nuevo | Público nuevo | VIN nuevo |
|---|---|---|---|---|
| Chevrolet Aveo | 2024→2022 | 125,820→127,880 | 159,850 | LSGHD52H2ND158903 |
| Hyundai Grand i10 | 2026→2024 | 160,240→160,880 | 201,100 | MALB24AC5RM267401 |
| Nissan Versa | 2024→2022 | 174,920→169,880 | 212,350 | 3N1CN8AE2NL847994 |
| Suburban Blindaje | 2015 (=) | 256,260→268,680 | 335,850 | 1GNSC8KC0FR270170, is_armored=true |
| Chevrolet Tahoe | 2023→2021 | 652,620→698,000 | 872,500 | 1GNSK8KL3MR233114 |
| MG HS Excite | 2024→2022 | 179,340→177,560 | 221,950 | LSJA24U6XNN115217 |
| Dodge Durango | 2017→2015 | 181,800→180,000 | 225,000 | 1C4RDHDG9FCI93466 |
| MG RX8 | 2024→2022 | 271,680→261,960 | 327,450 | LSJW84W90NG035280 |

Tambien se actualizan colores, estados de placas y VINs reales segun la imagen.

### Vehículo nuevo: Tucson GLC Premium 2023

- **Marca**: Hyundai
- **Tipo**: SUV
- **Precio empleado**: $351,500
- **Precio público**: $439,375
- **Color**: Gris plata
- **VIN**: TMCJB3UE6PJ249456
- **Placas**: CDMX
- **Kilometraje**: Sin dato en imagen (se dejará vacío o "0 km")
- **Slug**: `hyundai-tucson-glc-premium-2023`

### Implementación

1. Ejecutar 8 UPDATEs individuales contra la tabla `vehicles` usando la herramienta de inserción de Supabase (para precios, años, VINs, colores, placas)
2. Ejecutar 1 INSERT para la Tucson nueva con todos los campos requeridos
3. Verificar los datos actualizados con una consulta de lectura

### Nota

La Tucson no tiene kilometraje en la imagen. Se usará "0 km" a menos que indiques otro valor. Tampoco tiene imagen — se dejará con placeholder hasta que subas fotos.

