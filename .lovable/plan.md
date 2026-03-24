

## Restaurar el VIN real en la inyección de HubSpot

El valor `"TEST123"` fue un diagnóstico temporal. El serial number real ya existe en la BD y se obtiene correctamente. Solo hay que restaurar la línea original.

### Cambio

**Archivo: `src/pages/PurchaseRequest.tsx`**

Línea 86 — reemplazar:
```ts
const serialNumber = "TEST123"; // TEMPORAL: valor fijo para diagnóstico HubSpot
```
por:
```ts
const serialNumber = vin;
```

### Mejora adicional: disparar evento `change` tras inyectar el valor

HubSpot puede estar ignorando el valor porque no detecta un evento de cambio en el input. Después de cada `.val(serialNumber)` o `input.value = serialNumber`, dispararemos:
```ts
input.dispatchEvent(new Event("input", { bubbles: true }));
input.dispatchEvent(new Event("change", { bubbles: true }));
```

Esto es la causa más probable de que HubSpot no recoja el dato — frameworks de formularios modernos escuchan eventos, no solo el atributo `.value`.

### Resumen de cambios
- 1 archivo modificado: `src/pages/PurchaseRequest.tsx`
- Restaurar `vin` como valor del serial
- Añadir `dispatchEvent` de `input` y `change` en las 3 estrategias de inyección (onFormReady jQuery, onFormReady querySelector, onFormSubmit)

