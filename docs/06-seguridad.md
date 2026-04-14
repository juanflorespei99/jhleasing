# Seguridad y Privacidad

Detalles del modelo de seguridad, privacidad de datos y cumplimiento.

---

## 1. Modelo de seguridad en capas

El sistema tiene **4 capas** de protección que trabajan en conjunto:

1. **Autenticación (Supabase Auth)** — JWT con expiración, bcrypt para contraseñas.
2. **Autorización (roles)** — admin / employee / user en `user_roles`.
3. **Row Level Security (RLS)** — policies en PostgreSQL filtran por rol.
4. **Column-level GRANTs** — PostgreSQL restringe columnas accesibles por anon.

---

## 2. Roles del sistema

| Rol | Quién | Permisos |
|---|---|---|
| `admin` | Administradores designados | Acceso total: CRUD de vehículos, gestión de usuarios, dominios, edge functions privilegiadas |
| `employee` | Cualquier usuario registrado con dominio autorizado | Ver precios preferenciales, solicitar compra con precio preferencial, subir imágenes de vehículos |
| `user` | (Reservado, no se usa activamente) | Solo lectura pública |
| `anon` | Visitantes sin cuenta | Catálogo público con precios públicos |

---

## 3. Row Level Security (RLS)

### Tabla `vehicles`

| Operación | Quién | Condición |
|---|---|---|
| SELECT (directo) | Solo `authenticated` con rol admin | `has_role(auth.uid(), 'admin')` |
| INSERT | Solo admin | `has_role(auth.uid(), 'admin')` |
| UPDATE | Solo admin | `has_role(auth.uid(), 'admin')` |
| DELETE | Solo admin | `has_role(auth.uid(), 'admin')` |

> **Anon NO tiene acceso directo a `vehicles`.** Solo puede leer vía las vistas.

### Vistas `vehicles_public` y `vehicles_employee`

- **SECURITY DEFINER** — corren como el owner de la vista (postgres), bypaseando RLS de `vehicles`.
- **Acceso controlado vía GRANT:**
  - `vehicles_public` → GRANT SELECT a `anon` y `authenticated`
  - `vehicles_employee` → GRANT SELECT solo a `authenticated`
- Las vistas **filtran columnas en su SQL**:
  - `vehicles_public` omite: `vin`, `price_employee`, `sold_at`, `sold_price`, `buyer_name`, `sale_notes`
  - `vehicles_employee` omite: `sold_at`, `sold_price`, `buyer_name`, `sale_notes`
- Filtros de filas: solo vehículos activos, públicos (para `vehicles_public`), no vendidos.

### Tabla `user_roles`

| Operación | Quién |
|---|---|
| SELECT | Usuario lee solo su propio rol |
| INSERT/UPDATE/DELETE | Solo admin |

### Tabla `allowed_domains`

| Operación | Quién |
|---|---|
| SELECT | Solo admin |
| INSERT/UPDATE/DELETE | Solo admin |

### Tabla `brand_logos`

| Operación | Quién |
|---|---|
| SELECT | Público (anon + authenticated) |
| INSERT/UPDATE/DELETE | Solo admin |

### Storage buckets

| Bucket | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `vehicle-images` | Público | Solo admin (via `public.has_role()`) |
| `brand-logos` | Público | Solo admin (via `public.has_role()`) |

---

## 4. Protección de campos sensibles

| Campo | Quién lo ve | Cómo se protege |
|---|---|---|
| `vin` (Serial Number) | Admin + server-side (RPC) | No expuesto en vistas; solo recuperable vía `get_vehicle_vin()` desde `/solicitar-compra` |
| `price_employee` | Solo `authenticated` (empleados) | Vista `vehicles_employee` + GRANT limitado |
| `sold_price`, `buyer_name`, `sale_notes` | Solo admin | No expuesto en ninguna vista pública |
| Contraseñas de usuario | Nadie | Hasheadas por Supabase (bcrypt) |

---

## 5. Edge Functions — Seguridad server-side

Todas las edge functions que realizan operaciones privilegiadas **verifican el JWT y el rol server-side** antes de ejecutar cualquier acción.

### `manage-users`

```
1. Extrae JWT del header Authorization
2. Verifica JWT con supabase.auth.getUser()
3. Consulta user_roles con service role para verificar rol admin
4. Si no es admin → 403
5. Procede con la acción solicitada (list/create/update_role/delete/reset_password)
```

### `upload-vehicle-image`

```
1. Verifica JWT
2. Verifica que el caller tenga rol admin o employee
3. Valida MIME type (image/jpeg, image/png, image/webp)
4. Valida tamaño (<= MAX_BYTES configurado)
5. Decodifica base64 y sube al bucket con service role
```

### `on-signup`

```
1. Verifica firma HMAC del webhook con WEBHOOK_SECRET
2. Extrae dominio del correo del nuevo usuario
3. Consulta allowed_domains con service role
4. Si el dominio no existe → DELETE al usuario recién creado
5. Si existe → INSERT en user_roles con rol 'employee'
```

### `cleanup-unconfirmed`

```
1. Verifica CRON_SECRET en header
2. Borra usuarios con email_confirmed_at = NULL y creados hace > 24h
3. Solo se ejecuta desde cron de Supabase
```

---

## 6. Whitelist de dominios

El registro (`/registro`) es **restringido por dominio**. Solo correos de dominios en la tabla `allowed_domains` pueden crear cuenta.

### Dominios iniciales

- `jhl.mx`
- `creditoexpress.com`
- `scaletechconsulting.com`

### Gestión

Admins pueden agregar/eliminar dominios desde `/admin` → tab **Dominios**.

---

## 7. Protección de rutas en frontend

- `/admin` está envuelto en `<AdminGuard>` a **nivel de Route** en `App.tsx`.
- El guard verifica `useAuth().role === "admin"` antes de renderizar.
- Si no es admin: redirección a `/` sin flash de contenido.
- **Importante:** la protección de frontend es solo UX. La seguridad real está en RLS y edge functions (server-side).

---

## 8. Contraseñas y credenciales

### Usuarios finales

- **Mínimo 6 caracteres** en el registro.
- Supabase detecta contraseñas débiles (leaked passwords list) y las rechaza.
- Hasheadas con bcrypt por Supabase Auth.
- Tokens de recuperación y confirmación expiran en **24 horas**.

### Credenciales del sistema

- `SUPABASE_SERVICE_ROLE_KEY` — solo en edge functions env, nunca en frontend.
- `SUPABASE_ANON_KEY` — hardcoded en `client.ts`. **Es pública por diseño** — Supabase la protege con RLS.
- `WEBHOOK_SECRET` — solo en edge function env.
- `CRON_SECRET` — solo en edge function env.

---

## 9. Acciones destructivas

Todas las acciones irreversibles tienen **confirmación con palabra clave**:

- **Eliminar vehículo** — requiere escribir `ELIMINAR`
- **Eliminar vehículo vendido** — mismo patrón
- **Eliminar usuario** — diálogo con nombre del usuario
- **Eliminar dominio** — diálogo explicando el impacto

---

## 10. Validaciones de input

### Upload de imágenes de vehículo

- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: 5 MB por archivo (UI), 100 MB (edge function)
- Validación tanto en cliente como en servidor

### Upload de logo de marca

- Tipos permitidos: `image/png`, `image/jpeg`, `image/webp`
- Tamaño máximo: 2 MB
- Validación cliente + server (vía storage bucket policies)

### Carga masiva Excel

- Validación de tipos/enums en cliente antes de insertar
- Preview de errores fila por fila
- Insert solo si se confirma

### Formularios

- Regex de email en `/registro`
- Trim de espacios
- Validación de dominio vs TLD válido en panel de dominios

---

## 11. Privacidad de datos

### Datos personales que se almacenan

| Tipo | Dónde | Tiempo de retención |
|---|---|---|
| Correo electrónico | `auth.users` | Mientras la cuenta exista |
| Rol | `user_roles` | Mientras la cuenta exista |
| Nombre del comprador | `vehicles.buyer_name` | Permanente (histórico de ventas) |
| Notas de venta | `vehicles.sale_notes` | Permanente |

### Datos que NO se almacenan

- No se guardan direcciones IP de visitantes.
- No se usa Google Analytics ni ningún tracking de terceros (por default).
- No se almacenan contraseñas en texto plano.

### Derechos ARCO

El sistema está alineado con los derechos ARCO declarados en el Aviso de Privacidad de JH Leasing (acceso, rectificación, cancelación, oposición):

- **Acceso:** el admin puede consultar todos los datos del usuario en `/admin` → Usuarios.
- **Rectificación:** admin puede editar roles; usuario puede cambiar contraseña.
- **Cancelación:** admin puede eliminar la cuenta.
- **Oposición:** el registro no crea cuenta automática sin consentimiento explícito (click en link de confirmación).

---

## 12. Cumplimiento

- **LFPDPPP (México):** cumple con ley federal de protección de datos al:
  - No compartir datos con terceros no autorizados
  - Tener aviso de privacidad publicado en el footer
  - Permitir al usuario ejercer derechos ARCO vía el admin
  - Almacenar datos en servicios con certificaciones (Supabase: SOC 2)

- **GDPR (si aplica a empleados internacionales):**
  - Consentimiento explícito en registro
  - Derecho al olvido (eliminar cuenta)
  - Portabilidad (admin puede exportar datos vía Supabase)

---

## 13. Auditoría y monitoreo

### Logs disponibles

- **Supabase Dashboard** → Logs: ver requests a la API, errores de edge functions.
- **Auth logs** en Supabase: login attempts, password resets, signups.
- **GitHub** commit history: todos los cambios al código quedan registrados.

### Alertas recomendadas (no configuradas por default)

- Slack/email cuando se elimina un vehículo
- Notificación cuando se agrega un nuevo admin
- Alerta en intentos de login fallidos masivos

---

## 14. Auditoría de seguridad realizada

Durante el desarrollo se realizaron 3 pasadas de seguridad con los siguientes resultados:

- ✅ Autenticación JWT en todas las edge functions privilegiadas
- ✅ Verificación de rol server-side
- ✅ RLS habilitada en todas las tablas con datos sensibles
- ✅ Vistas con column filtering para proteger precio empleado y datos de venta
- ✅ Revocación de acceso directo de anon a tabla `vehicles`
- ✅ Storage bucket policies qualificadas con `public.has_role()`
- ✅ Whitelist de dominios para registro
- ✅ Confirmación por palabra clave en acciones destructivas
- ⚠️ TypeScript strict mode OFF (aceptado como deuda técnica)
- ⚠️ Sin suite de tests automatizados completa

---

## 15. Recomendaciones post-entrega

1. **Rotar `SUPABASE_SERVICE_ROLE_KEY` periódicamente** (cada 6 meses).
2. **Revisar los dominios autorizados trimestralmente** — eliminar los de socios inactivos.
3. **Backup de la BDD** — Supabase ofrece Point-in-Time Recovery en plan Pro.
4. **Monitorear logs** de edge functions para detectar intentos de acceso no autorizado.
5. **Actualizar dependencias** mensualmente (`bun update` o Dependabot).
6. **Considerar activar TypeScript strict** cuando el equipo tenga bandwidth.
7. **Considerar agregar 2FA** para cuentas admin (Supabase lo soporta).
