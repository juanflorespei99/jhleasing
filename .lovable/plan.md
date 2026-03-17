

## Limpieza automática de usuarios no confirmados

**Problema**: Usuarios que se registran pero nunca confirman su email se acumulan en `auth.users`, llenando la base de datos con registros inútiles.

**Solución**: Crear un cron job con `pg_cron` + `pg_net` que periódicamente invoque una Edge Function que elimine usuarios no confirmados después de cierto tiempo (por ejemplo, 24 horas).

### Implementación

1. **Crear Edge Function `cleanup-unconfirmed`**
   - Usa el service role key para consultar `auth.users` donde `email_confirmed_at IS NULL` y `created_at < NOW() - INTERVAL '24 hours'`
   - Elimina cada usuario con `supabase.auth.admin.deleteUser()`
   - Protegida con verificación de Authorization header

2. **Habilitar extensiones `pg_cron` y `pg_net`**
   - Migración SQL para activar ambas extensiones

3. **Crear cron job**
   - Ejecutar la función cada hora (o cada 6 horas, configurable)
   - Usa `net.http_post` para invocar la Edge Function

### Detalle técnico

- La Edge Function iterará sobre usuarios no confirmados con más de 24h de antigüedad y los borrará uno por uno vía `auth.admin.deleteUser()`
- El cron job se programa con `cron.schedule()` usando `pg_net` para hacer HTTP POST a la función
- El tiempo de gracia (24h) es configurable — suficiente para que un usuario real confirme, pero limpia los registros de prueba

### Archivos a crear/modificar
- `supabase/functions/cleanup-unconfirmed/index.ts` — nueva Edge Function
- `supabase/config.toml` — agregar configuración de la función
- Migración SQL — habilitar `pg_cron`, `pg_net` y crear el job programado

