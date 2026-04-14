# Operación y Mantenimiento

Guía práctica para mantener el sistema en producción.

---

## 1. Tareas de mantenimiento rutinario

### Diario / Semanal

| Tarea | Dónde | Frecuencia |
|---|---|---|
| Revisar inventario activo | `/admin` → Inventario | Semanal |
| Revisar nuevas ventas | `/admin` → Ventas | Diario |
| Responder solicitudes de compra | HubSpot inbox | Diario |

### Mensual

| Tarea | Dónde | Notas |
|---|---|---|
| Revisar usuarios registrados | `/admin` → Usuarios | Validar que sean legítimos |
| Revisar dominios autorizados | `/admin` → Dominios | Eliminar los obsoletos |
| Revisar logs de edge functions | Supabase Dashboard → Logs | Buscar errores recurrentes |
| Actualizar dependencias menores | `bun update` o Dependabot | En branch de test primero |

### Trimestral

| Tarea | Notas |
|---|---|
| Auditoría de seguridad | Revisar policies RLS, dominios, admin activos |
| Backup completo de BDD | Exportar desde Supabase Dashboard |
| Actualizar documentación | Reflejar cambios nuevos |

---

## 2. Respaldos (backups)

### Supabase (plan Free)

- **No incluye** Point-in-Time Recovery.
- Supabase hace snapshots automáticos diarios, pero no puedes restaurar a un momento específico.

### Supabase (plan Pro — recomendado)

- Incluye PITR (Point-in-Time Recovery) hasta 7 días atrás.
- Activarlo desde Supabase Dashboard → Settings → Backups.

### Backup manual recomendado

```sql
-- Exportar inventario actual
COPY (SELECT * FROM vehicles) TO STDOUT WITH CSV HEADER;

-- Exportar usuarios y roles
COPY (
  SELECT u.email, r.role, u.created_at
  FROM auth.users u
  LEFT JOIN user_roles r ON r.user_id = u.id
) TO STDOUT WITH CSV HEADER;
```

Ejecutarlos desde Supabase SQL Editor, copiar resultado y guardar.

---

## 3. Despliegue de cambios

### Cambios en código (frontend, edge functions)

1. Crear rama nueva desde `main`:
   ```
   git checkout -b feature/xxx
   ```
2. Hacer cambios.
3. Commit + push.
4. Abrir PR en GitHub: `gh pr create`.
5. Revisar.
6. Merge: `gh pr merge X --merge --delete-branch`.
7. **Lovable detecta el merge** y redeploya automáticamente en 1-2 minutos.

### Cambios en esquema de BDD (migraciones SQL)

⚠️ **Lovable NO aplica migraciones automáticamente.**

1. Crear archivo en `supabase/migrations/{timestamp}_descripcion.sql`.
2. Commit + push + merge (igual que cambios de código — sirve como historial).
3. **IMPORTANTE:** ir a **Supabase Dashboard → SQL Editor** y ejecutar el SQL manualmente.
4. Verificar que se aplicó correctamente con un SELECT.

---

## 4. Rollback de cambios

### Rollback de frontend

```bash
# Ver historial
git log --oneline -10

# Revertir el commit problemático
git revert HEAD         # o el hash específico
git push origin main
```

Lovable redeploya con el revert en 1-2 min.

### Rollback de migración SQL

Las migraciones son difíciles de revertir automáticamente. Escribe un SQL de "down migration" manualmente:

```sql
-- Ejemplo: revertir la migración que agregó brand_logos
DROP TABLE IF EXISTS public.brand_logos CASCADE;
DELETE FROM storage.buckets WHERE id = 'brand-logos';
-- Etc.
```

Ejecutar en SQL Editor.

---

## 5. Troubleshooting

### El sitio está caído / muestra error

1. **Abre Lovable** → dashboard del proyecto → ver estado del último deploy.
   - Si está en "Building" → esperar.
   - Si está en "Failed" → leer los logs del build.
2. **Revisa Supabase:** https://status.supabase.com
3. **Revisa el dominio:** puede haber expirado o tener problemas DNS.

### Un usuario no puede registrarse

| Síntoma | Causa | Solución |
|---|---|---|
| "Acceso restringido a colaboradores" | Dominio no autorizado | Agregar dominio en `/admin` → Dominios |
| "Correo ya registrado" | Ya existe el usuario | Resetear contraseña desde `/admin` → Usuarios |
| No llega correo de confirmación | En spam, o problema de SMTP de Supabase | Supabase permite confirmar manualmente desde dashboard |

### Los precios de empleado no se muestran

| Síntoma | Causa | Solución |
|---|---|---|
| Usuario logueado ve precio público | Sesión expiró | Logout + login |
| Empleado no ve precio preferencial tras login | El registro falló silenciosamente y no tiene rol | Revisar `user_roles` en SQL Editor y agregar manualmente |

### Falla la carga masiva

| Error | Causa | Solución |
|---|---|---|
| "El archivo no contiene hojas" | .xlsx corrupto | Re-descargar plantilla y llenar de nuevo |
| Muchos errores de "Tipo no permitido" | Valores escritos manualmente sin dropdown | Forzar uso del dropdown del Excel |
| Supabase error al insertar | RLS o constraint violation | Revisar log del browser console |

### No se suben imágenes

| Error | Causa | Solución |
|---|---|---|
| 401 Unauthorized | Sesión expirada | Logout + login |
| 403 Forbidden | Usuario no es admin/employee | Verificar rol en `user_roles` |
| 413 Too Large | Imagen > 5MB | Comprimir / redimensionar |
| Tipo no permitido | No es JPG/PNG/WebP | Convertir el archivo |

---

## 6. Monitoreo de performance

### En Supabase Dashboard

- **Database → Query Performance:** identifica queries lentas.
- **Reports → API:** visualiza tráfico, latencia.
- **Logs:** errores de edge functions, intentos de auth fallidos.

### En el browser

- DevTools → Network tab durante pruebas.
- Lighthouse score periódicamente.

---

## 7. Límites y cuotas

### Supabase plan Free

| Recurso | Límite | Upgrade si |
|---|---|---|
| Database storage | 500 MB | > 1000 vehículos con muchas imágenes |
| File storage | 1 GB | > 500 imágenes |
| Bandwidth | 5 GB/mes | Mucho tráfico |
| Edge function invocations | 500K/mes | Uso heavy de uploads/logins |
| Auth users | 50,000 | No se alcanzará en este contexto |

### Plan Pro ($25/mes)

- 8 GB DB storage
- 100 GB file storage
- 250 GB bandwidth
- 2M edge function invocations
- **PITR (backups)**
- **Read replicas**

**Recomendación:** pasar a plan Pro antes del lanzamiento público masivo.

---

## 8. Procedimientos de emergencia

### El sitio está comprometido

1. **Revocar todas las sesiones activas:**
   ```sql
   -- En Supabase SQL Editor
   DELETE FROM auth.sessions;
   ```
2. **Rotar llaves:**
   - Supabase Dashboard → Settings → API → Reset service role key
3. **Actualizar edge functions** con la nueva key.
4. **Auditar logs** para entender qué pasó.

### Base de datos corrupta

1. Contactar soporte de Supabase.
2. Si tienes PITR (plan Pro) → restaurar al punto anterior al incidente.
3. Si no, restaurar desde backup manual.

### Admin comprometido

1. Eliminar el usuario:
   ```sql
   DELETE FROM user_roles WHERE user_id = 'uuid-del-admin-comprometido';
   -- Supabase Dashboard → Authentication → Users → eliminar el usuario
   ```
2. Auditar cambios recientes en inventario y ventas.

---

## 9. Actualización de dependencias

### Dependencias del frontend

```bash
# Ver outdated
bun outdated

# Actualizar minor/patch (seguro)
bun update

# Actualizar mayor (revisar breaking changes)
bun add react@latest react-dom@latest
```

Después de actualizar:

1. `bun run dev` — probar localmente.
2. `bun run build` — asegurar que el build funciona.
3. Commit + PR.

### Actualizaciones de Supabase

- **Deno runtime de edge functions:** Supabase maneja esto automáticamente.
- **PostgreSQL version:** Supabase ofrece upgrades vía dashboard. Hacer backup antes.

---

## 10. Documentos relacionados

- [Manual de Usuario](./02-manual-usuario.md)
- [Manual de Administrador](./03-manual-administrador.md)
- [Documentación Técnica](./05-tecnologia.md)
- [Seguridad y Privacidad](./06-seguridad.md)

---

## 11. Contactos clave

| Persona / Servicio | Contacto |
|---|---|
| Desarrollo | Scaletech Consulting — _(contacto)_ |
| Hosting | Lovable support: https://lovable.dev/support |
| Base de datos | Supabase support: https://supabase.com/support |
| Dominio | _(registrador del dominio jhleasing.scaletechconsulting.mx)_ |

---

## 12. Checklist pre-entrega al cliente

- [x] Sitio en producción funcionando
- [x] Panel admin accesible
- [x] Al menos un admin creado (juanflorespei99)
- [x] Seed de dominios autorizados aplicado
- [x] Al menos un vehículo de prueba visible
- [x] Aviso y política de privacidad enlazados en footer
- [x] Documentación completa (este paquete)
- [ ] Credenciales entregadas al cliente (email del admin)
- [ ] Capacitación al equipo operativo (recomendada)
- [ ] Plan Pro de Supabase (si aplica)
- [ ] Backup inicial realizado
