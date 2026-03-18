

# Plan: Comparador de Vehículos

## Resumen
Crear una página `/comparar` donde el usuario selecciona 2 vehículos del inventario y ve una tabla comparativa lado a lado con todos los datos disponibles (año, precio, kilometraje, tipo, ubicación, estatus).

## Arquitectura

```text
VehicleDetail.tsx
  └─ Botón "Comparar" → navega a /comparar?a={slug}

/comparar?a={slug}&b={slug}
  ├─ Selector de vehículos (dropdown con búsqueda)
  ├─ Tabla comparativa lado a lado
  │   ├─ Imagen principal
  │   ├─ Nombre / Marca / Año
  │   ├─ Precio (público o empleado según rol)
  │   ├─ Kilometraje
  │   ├─ Tipo (SUV, Sedán, etc.)
  │   ├─ Ubicación
  │   └─ Estatus
  └─ Anotaciones automáticas
      ├─ "X es $Y más económico"
      ├─ "X tiene menos kilometraje"
      └─ "Ambos son SUV" / "X es SUV, Y es Sedán"
```

## Implementación

### 1. Nueva página `src/pages/Compare.tsx`
- Recibe query params `?a=slug&b=slug` (uno o ambos opcionales)
- Carga vehículos desde Supabase (vista pública o tabla completa según rol)
- Dos selectores tipo dropdown para elegir vehículos del inventario
- Tabla comparativa con las métricas lado a lado
- Sección de "Conclusiones" auto-generadas comparando precio, km, tipo

### 2. Componente `src/components/VehicleCompareSelector.tsx`
- Dropdown con búsqueda que lista los vehículos disponibles
- Muestra imagen miniatura + nombre + año en cada opción
- Permite cambiar la selección en cualquier momento

### 3. Botón en `VehicleDetail.tsx`
- Agregar botón "Comparar" junto al botón "Solicitar Compra"
- Al hacer click, navega a `/comparar?a={slug-actual}` con el vehículo actual pre-seleccionado

### 4. Ruta en `App.tsx`
- Agregar `<Route path="/comparar" element={<Compare />} />`

### 5. Conclusiones automáticas
Lógica simple que compara los valores y genera frases como:
- Diferencia de precio: "El Chevrolet Aveo es $45,000 más económico"
- Kilometraje: parsear el string de km y comparar
- Tipo: indicar si son del mismo segmento o diferente
- Año: "El GMC Yukon es 2 años más reciente"

## Datos comparados
Todos los campos disponibles: año, precio, kilometraje, tipo, ubicación, estatus, marca, descripción. El diseño sigue el estilo `neu-card` existente.

