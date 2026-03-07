

## Plan: Mini-comparador funcional en la barra lateral

### Contexto
Actualmente el CTA de comparacion es un banner estatico debajo del grid de vehiculos. El usuario quiere moverlo al panel izquierdo (debajo de la linea de tiempo "Como Comprar") y convertirlo en un widget funcional donde se puedan seleccionar dos vehiculos y ver una mini-comparativa inline sin salir de la landing.

### Cambios

#### 1. Nuevo componente `src/components/MiniCompare.tsx`
Widget compacto que:
- Muestra dos selectores pequenos (dropdowns) para elegir vehiculo A y B del inventario disponible
- Al seleccionar ambos, muestra una mini-tabla comparativa con: precio, ano, kilometraje (3 metricas clave)
- Incluye un boton "Ver comparativa completa" que lleva a `/comparar?a=slugA&b=slugB`
- Usa estilos `neu-tag`, `neu-inset-sm` consistentes con el sidebar
- Los selectores seran versiones compactas (thumbnails mas pequenos, texto reducido)

#### 2. Modificar `src/components/VehicleFilters.tsx`
- Recibir nueva prop `vehicles: VehicleRow[]` para pasarla al mini-comparador
- Agregar el componente `MiniCompare` debajo del bloque "Como Comprar" (despues de linea 111), separado con `border-t`

#### 3. Modificar `src/pages/Index.tsx`
- Pasar `vehicles` como prop a `VehicleFilters`
- Eliminar la seccion "Compare CTA" (lineas 166-187) ya que la funcionalidad ahora vive en el sidebar

### Diseno del mini-comparador

```text
┌─────────────────────────┐
│ COMPARAR MODELOS        │  <- label-micro
│                         │
│ [▼ Seleccionar A...]    │  <- dropdown compacto
│ [▼ Seleccionar B...]    │  <- dropdown compacto
│                         │
│ ┌─────┬───────┬───────┐ │  <- mini tabla (solo si ambos seleccionados)
│ │     │  A    │  B    │ │
│ │Precio│$XXX  │$XXX   │ │
│ │Año   │2024  │2023   │ │
│ │Km    │70k   │85k    │ │
│ └─────┴───────┴───────┘ │
│                         │
│ [Ver comparativa completa]│ <- Link a /comparar?a=&b=
└─────────────────────────┘
```

Responsive: en movil, el sidebar se oculta/muestra con el toggle existente, asi que el mini-comparador seguira ese mismo comportamiento.

