

## Problema

La Edge Function `cleanup-unconfirmed` verifica la autorización comparando el header `Authorization` con la **anon key** de Supabase:

```ts
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
if (!authHeader || authHeader !== `Bearer ${anonKey}`) { ... }
```

Esa anon key es **pública** — está en el bundle JavaScript del frontend. Cualquier persona puede copiarla y llamar al endpoint para eliminar todos los usuarios no confirmados (ataque DoS contra nuevos registros).

## Solución

Reemplazar la anon key por un **secreto privado dedicado** (`CRON_SECRET`):

1. **Crear un secreto** `CRON_SECRET` en Supabase Edge Function secrets con un valor aleatorio seguro.
2. **Actualizar `cleanup-unconfirmed/index.ts`** para validar contra ese secreto en lugar de la anon key:
   ```ts
   const cronSecret = Deno.env.get("CRON_SECRET");
   if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
     return new Response(..., { status: 401 });
   }
   ```
3. **Actualizar el job de `pg_cron`** que invoca la función para que envíe el mismo `CRON_SECRET` en el header Authorization, usando `vault.decrypted_secrets` para leer el secreto de forma segura.

Esto asegura que solo el scheduler interno pueda ejecutar la limpieza.

