

## Diagnóstico

### 1. SUPA_security_definer_view
La vista `vehicles_public` ya tiene `security_invoker=on` (verificado en `pg_class.reloptions`). La migración anterior se aplicó correctamente. Este hallazgo probablemente es del escaneo anterior y se puede marcar como resuelto.

### 2. register_domain_clientside
`Register.tsx` tiene los dominios permitidos hardcodeados en el JS bundle (línea 16). Aunque el servidor ya valida via la Edge Function `on-signup`, el problema es doble:
- La validación client-side es bypaseable con llamadas directas a la API de Supabase Auth
- Los nombres de dominio internos quedan expuestos en el bundle JS

## Plan

### Paso 1: Eliminar allowlist hardcodeada de Register.tsx
- Quitar la constante `ALLOWED_DOMAINS` y la validación de dominio del frontend
- La Edge Function `on-signup` ya valida contra la tabla `allowed_domains` y elimina usuarios no autorizados
- Reemplazar con un mensaje genérico de restricción solo como UX hint (sin revelar dominios)

### Paso 2: Marcar ambos findings como resueltos
- `SUPA_security_definer_view`: ya corregido en migración anterior
- `register_domain_clientside`: corregido al eliminar la allowlist del cliente

### Cambios en código

**`src/pages/Register.tsx`** — Eliminar líneas 16 y 22-26:
- Quitar `const ALLOWED_DOMAINS = [...]`
- Quitar el bloque `if (!domain || !ALLOWED_DOMAINS.includes(domain))`
- Si el servidor rechaza el signup (dominio no permitido), la Edge Function elimina al usuario, y el flujo normal de confirmación por email simplemente no procederá — el usuario nunca podrá confirmar

No se requieren cambios en backend ni migraciones.

