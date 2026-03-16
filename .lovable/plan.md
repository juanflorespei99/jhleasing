

## Plan: Agregar dominio `payefy.me` como dominio autorizado

### Problema
El dominio `@payefy.me` no está en la lista de dominios permitidos. Hay **dos lugares** donde se valida:

1. **Frontend** (`src/pages/Register.tsx` línea 16): array hardcodeado `ALLOWED_DOMAINS`
2. **Base de datos** (tabla `allowed_domains`): consultada por la edge function `on-signup`

Actualmente los dominios permitidos son: `jhl.mx`, `creditoexpresss.com`, `scaletechconsulting.mx`.

### Cambios necesarios

1. **`src/pages/Register.tsx`** — Agregar `"payefy.me"` al array `ALLOWED_DOMAINS`
2. **Nueva migración SQL** — Insertar el dominio en la tabla `allowed_domains`:
   ```sql
   INSERT INTO allowed_domains (domain) VALUES ('payefy.me') ON CONFLICT DO NOTHING;
   ```

Dos cambios, ambos sencillos. No se requiere modificar la edge function ni ningún otro archivo.

