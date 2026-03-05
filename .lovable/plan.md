

# Plan: Generador de Imágenes IA para Vehículos

## Problema
Las imágenes actuales de los vehículos son de baja calidad (Wikipedia, genéricas). Se necesita una forma de generar o buscar imágenes profesionales desde el panel de admin.

## Solución Propuesta

Integrar el modelo **Nano Banana** (`google/gemini-2.5-flash-image`) disponible a traves de Lovable AI Gateway para generar imágenes de vehículos directamente desde el formulario de admin. El admin escribe un prompt (o se auto-genera uno basado en marca/modelo/año) y recibe imágenes generadas por IA que puede seleccionar y guardar.

## Arquitectura

```text
VehicleForm (admin)
  ├─ Botón "Generar con IA"
  │   └─ Dialog con prompt editable
  │       └─ "Genera una foto profesional de un Chevrolet Aveo 2024..."
  │
  ├─ Llama Edge Function: generate-vehicle-image
  │   └─ POST → Lovable AI Gateway (gemini-2.5-flash-image)
  │       └─ Retorna base64 image
  │
  ├─ Muestra preview de imagen generada
  │   └─ Admin acepta → sube a Supabase Storage (vehicle-images)
  │       └─ Se agrega URL a la lista de imágenes del vehículo
  │
  └─ Admin puede regenerar o ajustar prompt
```

## Implementacion

### 1. Edge Function `generate-vehicle-image`
- Recibe: `{ prompt: string }` (ej: "Foto profesional de estudio de un Chevrolet Aveo 2024 sedan plateado, fondo blanco")
- Usa `LOVABLE_API_KEY` (ya configurado) para llamar al gateway con `modalities: ["image", "text"]`
- Retorna la imagen base64 al cliente
- Manejo de errores 429/402

### 2. Componente `AIImageGenerator`
- Dialog/modal dentro del VehicleForm
- Auto-genera prompt basado en marca, modelo, año y tipo seleccionados
- Campo de texto editable para que el admin ajuste el prompt
- Botón "Generar" → muestra loading → muestra imagen generada
- Botones: "Usar esta imagen" (sube a storage y agrega), "Regenerar", "Cancelar"
- Opcion de generar multiples imagenes (una a la vez)

### 3. Modificaciones al VehicleForm
- Agregar botón "Generar con IA" junto al botón de subir imágenes
- Las imágenes generadas y aceptadas se tratan igual que las subidas manualmente

## Flujo del Admin

1. Llena marca, modelo, año en el formulario
2. Click "Generar con IA" → se abre modal con prompt sugerido: *"Fotografía profesional de estudio de un [Marca] [Modelo] [Año], tipo [Tipo], vista frontal 3/4, fondo limpio, iluminación de estudio"*
3. Puede editar el prompt si quiere otra vista/color/ángulo
4. Click "Generar" → espera ~5-10s → ve la imagen
5. Si le gusta → "Usar imagen" (se sube a storage automáticamente)
6. Si no → "Regenerar" o ajusta el prompt
7. Puede repetir para obtener varias imágenes (lateral, trasera, interior)

## Notas Técnicas
- `LOVABLE_API_KEY` ya existe en secrets, no se necesita configurar nada adicional
- Las imágenes base64 se suben a `vehicle-images` bucket (ya existe, público)
- El modelo `gemini-2.5-flash-image` es el mas rapido y economico; si la calidad no satisface se puede cambiar a `gemini-3-pro-image-preview` (mas lento pero mejor calidad)

