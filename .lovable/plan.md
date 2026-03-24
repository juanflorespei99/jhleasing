

## Plan: Ocultar y llenar Número de Serie — solución definitiva

**Causa raíz confirmada**: HubSpot's new form editor no dispara los callbacks `onFormReady` ni `onFormSubmit`. Todo el código de inyección depende de esos callbacks → nunca se ejecuta.

**Solución**: Abandonar la dependencia de callbacks de HubSpot. Usar un **MutationObserver + polling directo del DOM** que busque el campo por texto del label o nombre del input, sin depender de `$form` ni de callbacks.

### Archivo: `src/pages/PurchaseRequest.tsx`

**Cambios principales:**

1. **Eliminar la lógica `hideAndFillSerial($form)`** que depende del objeto jQuery `$form` de HubSpot (nunca llega).

2. **Crear una función `processSerialField()`** que:
   - Busca en el DOM del contenedor `#hubspot-purchase-form` (y dentro de cualquier iframe accesible) todos los `.hs-form-field`
   - Identifica el campo cuyo label contenga "serie" (regex `/serie/i`) o cuyo input tenga `numero_de_serie` en el name
   - Lo oculta con `display:none!important`
   - Lo rellena con el VIN y dispara eventos `input` + `change`

3. **Montar un MutationObserver** en el contenedor del formulario que llame `processSerialField()` cada vez que HubSpot modifique el DOM (añada campos, re-renderice, etc.)

4. **Añadir un intervalo de respaldo** (cada 500ms durante 15s) por si el Observer no detecta mutaciones relevantes.

5. **Mantener los callbacks `onFormReady`/`onFormSubmit`** como capas adicionales (por si en el futuro el form vuelve a ser legacy), pero la lógica principal ya no depende de ellos.

6. **Para iframes**: Intentar acceder al `contentDocument` del iframe (funciona si es same-origin). Si HubSpot lo renderiza cross-origin, inyectar el VIN usando `postMessage` como fallback, o buscar el iframe y aplicar la misma lógica si es accesible.

### Detalle técnico clave

```typescript
// Función independiente de callbacks — busca directamente en el DOM
const processSerialField = () => {
  const root = document.getElementById("hubspot-purchase-form");
  if (!root) return;
  
  // Buscar en DOM directo
  scanAndHide(root);
  
  // Buscar dentro de iframes accesibles
  root.querySelectorAll("iframe").forEach(iframe => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) scanAndHide(doc);
    } catch { /* cross-origin, skip */ }
  });
};

const scanAndHide = (root: Document | HTMLElement) => {
  root.querySelectorAll(".hs-form-field").forEach(field => {
    const label = field.querySelector("label");
    const input = field.querySelector("input") as HTMLInputElement;
    if (
      (label && /serie/i.test(label.textContent || "")) ||
      (input && /numero_de_serie/i.test(input.name))
    ) {
      (field as HTMLElement).style.cssText = "display:none!important";
      if (input && input.value !== serialNumber) {
        input.value = serialNumber;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
};

// Observer + polling — no depende de callbacks
const observer = new MutationObserver(() => processSerialField());
observer.observe(container, { childList: true, subtree: true });
const interval = setInterval(processSerialField, 500);
setTimeout(() => clearInterval(interval), 15000);
```

### Resultado esperado
- El campo "Número de Serie" se oculta **inmediatamente** al aparecer en el DOM, sin depender de ningún callback de HubSpot.
- El VIN se inyecta automáticamente en el campo oculto.
- Funciona con formularios del editor nuevo y legacy, inline o en iframe (si es same-origin).

