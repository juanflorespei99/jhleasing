

## Simplificar la inyección del Serial Number en HubSpot

### Problema actual
El código tiene 3 estrategias complejas (jQuery, iframe contentDocument, parent DOM) con hacks como `Object.getOwnPropertyDescriptor` y React synthetic event dispatching. HubSpot mismo recomienda un enfoque mucho más simple usando el callback `onFormReady` con `$form.find()` o `document.querySelector()` + `setTimeout`.

### Lo que dice HubSpot
La guía que compartiste confirma que el enfoque correcto es:
- Usar `onFormReady($form)` con `$form.find('input[name="numero_de_serie"]').val(valor)`
- O bien `document.querySelector('input[name="numero_de_serie"]')` con un `setTimeout` de ~500ms
- Y reforzar en `onFormSubmit` para garantizar que el valor esté presente antes del envío

### Plan

**Archivo: `src/pages/PurchaseRequest.tsx`**

Simplificar el bloque `onFormReady` y `onFormSubmit` siguiendo exactamente el patrón recomendado por HubSpot:

1. **`onFormReady($form)`**: 
   - Intentar `$form.find('input[name="numero_de_serie"]').val(serialNumber)` (método jQuery que HubSpot provee)
   - Como fallback, usar `setTimeout` con `document.querySelector` en el DOM del contenedor (el patrón exacto que HubSpot recomienda)
   - Reintentar a 500ms, 1500ms y 3000ms si no se encuentra el input

2. **`onFormSubmit($form)`**:
   - Mismo enfoque simplificado: `$form.find()` + fallback `querySelector`
   - Forzar el valor justo antes del envío como guardián final

3. **Eliminar**: Las estrategias de iframe `contentDocument` y los hacks de `Object.getOwnPropertyDescriptor` que no son necesarios según la guía oficial

4. **Mantener**: La lógica de `get_vehicle_vin` RPC, el `onFormSubmitted` con `reserve_vehicle`, y el ocultamiento de decoración de HubSpot

### Cambios
- Solo `src/pages/PurchaseRequest.tsx` — simplificar ~100 líneas de estrategias de inyección a ~30 líneas siguiendo el patrón oficial de HubSpot

