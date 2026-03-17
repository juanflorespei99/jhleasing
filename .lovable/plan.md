

## Plan: Agregar imagen del vehículo a la página de solicitud de compra

### Cambio

**`src/pages/PurchaseRequest.tsx`**:
- Ampliar el query de Supabase para incluir `img`, `year`, `price_public` además de `name` y `vin`
- Agregar estado para estos campos adicionales
- Antes del formulario, dentro del `neu-card`, mostrar una tarjeta visual con:
  - Imagen principal del vehículo (`img`) con bordes redondeados
  - Nombre y año del vehículo
  - Precio formateado
- Layout: imagen arriba del formulario, dentro del mismo card, con un separador visual entre ambos

### Resultado
El usuario ve claramente qué vehículo está solicitando antes de llenar el formulario.

