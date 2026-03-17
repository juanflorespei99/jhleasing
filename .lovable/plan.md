

## Problema

El reCAPTCHA de Google abre un popup (iframe) para seleccionar imágenes, pero el **overlay del Dialog de Radix** (`z-50`, `pointer-events: auto`) intercepta los clics antes de que lleguen al iframe del CAPTCHA. Por eso solo funciona cuando cierras el diálogo: el overlay desaparece y el CAPTCHA queda accesible.

## Causa raíz

- El `DialogOverlay` tiene `z-50` y cubre toda la pantalla con `pointer-events`.
- El reCAPTCHA challenge se renderiza como un iframe **fuera** del DialogContent, directamente en el `<body>`, con su propio z-index.
- Radix Dialog además atrapa el foco (focus trap), lo que puede interferir con la interacción del iframe del CAPTCHA.

## Solución: dos opciones

### Opción A — Desactivar el CAPTCHA desde HubSpot (recomendada)

La propiedad `captchaEnabled: false` que ya tenemos solo funciona si el formulario en HubSpot **no tiene CAPTCHA forzado** desde el portal. Como se ve en las capturas, el CAPTCHA sigue apareciendo, lo que significa que **está habilitado a nivel del formulario en HubSpot** y la opción del embed no lo puede sobreescribir.

**Acción necesaria del usuario**: Ir al portal de HubSpot → Marketing → Forms → editar el formulario `9924bd04...` → Options → desactivar reCAPTCHA. Esto es lo más limpio.

### Opción B — Fix técnico en el código (si el CAPTCHA debe quedarse)

Si el CAPTCHA es obligatorio, necesitamos asegurar que el iframe del reCAPTCHA quede por encima del overlay del diálogo:

1. **Agregar CSS global** que aumente el `z-index` del iframe del reCAPTCHA de Google:
   ```css
   /* En index.css */
   div[style*="z-index"] > div > iframe[src*="recaptcha"],
   iframe[src*="recaptcha/api2/bframe"],
   div.rc-imageselect,
   body > div[style*="z-index"]:has(iframe[src*="recaptcha"]) {
     z-index: 2147483647 !important;
   }
   ```

2. **Desactivar el focus trap de Radix** cuando el CAPTCHA está activo, pasando `onOpenAutoFocus` y evitando que Radix capture el foco fuera del diálogo. Esto se logra agregando `onInteractOutside={(e) => e.preventDefault()}` al DialogContent para evitar que se cierre, pero sin bloquear clics en el CAPTCHA.

3. **Alternativa más robusta**: En lugar de usar un Dialog modal, cambiar a un **Sheet** (drawer lateral) o abrir el formulario en una **página dedicada** en lugar de un modal, eliminando por completo el conflicto de z-index y focus trap.

### Plan de implementación recomendado

Combinar ambas opciones:

1. **En `src/index.css`**: Agregar regla CSS global para forzar z-index máximo en los iframes de reCAPTCHA de Google.

2. **En `src/components/PurchaseRequestDialog.tsx`**: Agregar `onInteractOutside` al DialogContent para prevenir cierre al interactuar con el CAPTCHA, y agregar `onPointerDownOutside` con la misma lógica.

3. **Informar al usuario** que la solución definitiva es desactivar el CAPTCHA desde el portal de HubSpot, ya que `captchaEnabled: false` no lo está logrando.

### Archivos a modificar
- `src/index.css` — regla CSS para z-index del reCAPTCHA
- `src/components/PurchaseRequestDialog.tsx` — manejo de interacciones fuera del diálogo

