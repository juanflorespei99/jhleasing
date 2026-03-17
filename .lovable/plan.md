

## Solución: Página dedicada para Solicitar Compra

El reCAPTCHA de HubSpot no funciona dentro de modales/drawers porque Radix captura el foco y bloquea clics en iframes externos. La solución definitiva es sacar el formulario a su propia página.

### Cambios

**1. Nueva página `src/pages/PurchaseRequest.tsx`**
- Ruta: `/solicitar-compra/:slug`
- Recibe el slug del vehículo por URL params
- Consulta Supabase para obtener nombre y VIN del vehículo
- Renderiza el formulario HubSpot directamente en la página (sin modal, sin overlay)
- Usa el mismo método de inserción del VIN con `hbspt.forms.create` y `onFormReady`
- Incluye navegación de regreso al vehículo
- Mantiene el estilo visual del sitio (nav, neu-card, etc.)

**2. Modificar `src/App.tsx`**
- Agregar ruta `/solicitar-compra/:slug`

**3. Modificar `src/pages/VehicleDetail.tsx`**
- El botón "Solicitar Compra" ahora navega a `/solicitar-compra/${vehicle.slug}` en lugar de abrir el dialog
- Eliminar import de `PurchaseRequestDialog`, el estado `purchaseOpen`, y el componente del JSX

**4. `src/components/PurchaseRequestDialog.tsx`**
- Se puede eliminar o dejar como código muerto (prefiero eliminarlo para limpieza)

### Resultado
El formulario HubSpot vive en una página propia sin overlays ni focus traps, eliminando por completo el conflicto con reCAPTCHA.

