

## Actualizar el job de pg_cron para usar CRON_SECRET

El código de la Edge Function ya valida contra `CRON_SECRET`. Ahora falta que el job de `pg_cron` envíe ese secreto en lugar de la anon key.

### Pasos

1. **Guardar el CRON_SECRET en el Vault de Supabase** (si no se ha hecho):
   ```sql
   SELECT vault.create_secret('TU_VALOR_DE_CRON_SECRET', 'CRON_SECRET');
   ```

2. **Eliminar el job anterior y crear uno nuevo** que lea el secreto del vault:
   ```sql
   SELECT cron.unschedule('cleanup-unconfirmed-users');

   SELECT cron.schedule(
     'cleanup-unconfirmed-users',
     '0 */6 * * *',
     $$
     SELECT net.http_post(
       url := 'https://rbkqgzairobefrmfdkei.supabase.co/functions/v1/cleanup-unconfirmed',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'CRON_SECRET' LIMIT 1)
       ),
       body := '{}'::jsonb
     ) AS request_id;
     $$
   );
   ```

Ambos SQLs se ejecutarán vía el SQL Editor de Supabase (no como migración, ya que contienen datos específicos del proyecto). Yo los ejecutaré con la herramienta de queries directas.

