

## Plan: Ocultar campo "Número de Serie" y asegurar llenado automático

**Problema**: El campo "Número de Serie" aparece visible y vacío en el formulario de HubSpot. El cliente no conoce este dato — debe llenarse automáticamente con el VIN del vehículo y estar oculto.

**Solución** (archivo: `src/pages/PurchaseRequest.tsx`):

1. **Agregar CSS para ocultar el campo**: Añadir una regla CSS que oculte el contenedor `.hs_numero_de_serie` (clase que HubSpot genera para el field group del campo `numero_de_serie`).

2. **Reforzar la ocultación vía JS en `onFormReady`**: Después de inyectar el VIN, buscar el contenedor padre del input y ocultarlo con `display:none` por si el selector CSS no aplica exactamente.

3. **Mantener la inyección actual**: El campo sigue existiendo en el DOM (solo oculto), así que la lógica de inyección del VIN funciona igual.

### Cambios técnicos

En el bloque `<style>` existente, agregar:
```css
#hubspot-purchase-form .hs_numero_de_serie { display: none !important; }
```

En `onFormReady`, tras inyectar el valor, ocultar el contenedor padre del input encontrado:
```typescript
if (input) {
  // ... existing injection logic ...
  // Hide the field container
  const fieldGroup = input.closest('.hs-form-field');
  if (fieldGroup) (fieldGroup as HTMLElement).style.display = 'none';
}
```

