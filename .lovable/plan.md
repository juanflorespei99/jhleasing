

## Plan: Probar el flujo completo de recuperación de contraseña

Ahora que la URL `https://jhleasing.scaletechconsulting.mx/reset-password` está configurada como Redirect URL en Supabase, el flujo debería funcionar correctamente.

### Lo que ya está implementado

1. **Bootstrap temprano** (`main.tsx`): Intercepta parámetros de recuperación en la URL antes de que Supabase los consuma
2. **Detección de recovery** (`auth-recovery.ts`): Detecta `type=recovery`, `token_hash`, y errores como `otp_expired`
3. **Redirección en React** (`RecoveryRedirect.tsx`): Respaldo dentro del router
4. **Edge Function** (`manage-users`): Usa `redirectTo` apuntando a `/reset-password` en producción
5. **Página ResetPassword**: Formulario funcional con manejo de errores

### Próximo paso

1. **Publicar la app** — Los cambios de frontend (bootstrap, auth-recovery.ts, RecoveryRedirect) deben estar publicados en el dominio custom para que funcionen
2. **Enviar correo de prueba** — Usar la Edge Function `manage-users` con `redirectTo` correcto
3. **Hacer clic en el enlace** — Verificar que llega a `/reset-password` y muestra el formulario

### Acción requerida

Necesito confirmar: **¿ya publicaste los últimos cambios al dominio?** Si no, es necesario publicar primero para que el nuevo código de redirección esté activo en `jhleasing.scaletechconsulting.mx`.

