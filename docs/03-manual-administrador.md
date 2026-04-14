# Manual de Administrador

Guía completa del **panel administrativo** en `/admin`.

---

## 1. Acceso al panel

- URL: `/admin`
- Requisito: cuenta con rol **`admin`** (asignado en la tabla `user_roles`)
- Si intentas acceder sin rol admin, el sistema redirige automáticamente al inicio.

### Primer acceso

Las cuentas admin se crean de dos formas:

1. **Desde el panel mismo** — un admin existente crea otro (ver sección [Usuarios](#4-usuarios))
2. **Desde Supabase directamente** — ejecutando SQL:
   ```sql
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'correo@dominio.com';
   ```

---

## 2. Estructura del panel

El panel tiene **4 tabs**:

| Tab | Icono | Función |
|---|---|---|
| Inventario | 🚗 | Gestión de vehículos en venta |
| Ventas | 💰 | Registro histórico de vehículos vendidos |
| Usuarios | 👥 | Gestión de cuentas y roles |
| Dominios | 🌐 | Gestión de dominios autorizados para registro |

En la parte superior: **estadísticas rápidas** (total de vehículos, activos, públicos, exclusivos, vendidos).

---

## 3. Inventario

### Vista general

- Lista completa de vehículos no vendidos.
- Cada tarjeta muestra: foto, marca/modelo, año, tipo, precios (público y empleado), margen, kilometraje, ubicación, VIN.
- Barra de búsqueda filtra por nombre, marca, VIN, ubicación.

### Alta individual de vehículo

1. Click en **"Nuevo Vehículo"** (botón naranja arriba a la derecha).
2. Se abre el formulario modal.
3. Llena los campos:

| Campo | Obligatorio | Notas |
|---|---|---|
| Marca | ✅ | Combobox: selecciona del catálogo o escribe una marca nueva |
| Tipo | ✅ | SUV, Sedán, Hatchback, Pick-up, Van, Coupé |
| Modelo / Nombre | ✅ | Ej: "Aveo LT" |
| Año | — | Default: año actual |
| Precio Público | — | En MXN, sin comas ni $ |
| Precio Empleado | — | 30% descuento del público |
| Kilometraje | — | Ej: "25,000 km" |
| Serial Number (VIN) | — | No se muestra en el sitio público |
| Color | — | Catálogo predefinido |
| Estado de Placas | — | Catálogo de 32 estados de México |
| Ubicación | — | Ej: "CDMX" |
| Descripción | — | Texto libre |
| Fecha de Liberación | — | Si se deja en blanco, visible inmediatamente. Si se pone fecha futura, aparece en el catálogo a partir de esa fecha. |
| **Público** | Switch | Si está OFF, el vehículo solo es visible para empleados (modo exclusivo) |
| **Activo** | Switch | Si está OFF, el vehículo no aparece en el catálogo |
| **Blindado** | Switch | Se muestra con badge especial en filtros |
| Imágenes | — | PNG/JPG/WebP, máx 5MB cada una |

4. Click en **"Crear Vehículo"**.

### Marcas personalizadas (fuera del catálogo)

Si la marca no está en las 26 predefinidas:

1. En el combobox de Marca, escribe el nombre (ej: "Cupra").
2. Aparece la opción **"Usar marca: Cupra"** al final de la lista.
3. Selecciona esa opción.
4. Aparece un panel **"Subir logo"** debajo del campo.
5. Haz click en **"Subir logo"** y elige un PNG/JPG/WebP (máx 2MB, fondo transparente recomendado).
6. El logo se sube a Supabase Storage y se registra en la tabla `brand_logos`.
7. A partir de ese momento, la marca aparece con su logo en los filtros del catálogo.

### Alta masiva vía Excel

1. Click en **"Plantilla"** → descarga `plantilla-vehiculos.xlsx`.
2. Abre el archivo en **Excel** o **Google Sheets** (no en Numbers — soporte limitado de dropdowns).
3. La plantilla tiene 3 hojas:
   - **Vehículos** — aquí llenas los datos
   - **_Datos** (oculta) — referencia interna
   - **Instrucciones** — lista de valores válidos
4. Las columnas **Marca, Tipo, Color, Estado de Placas, Blindado, Público, Activo** tienen **menús desplegables**.
5. Llena las filas (campos obligatorios: **Marca, Modelo, Tipo**).
6. Guarda el archivo.
7. Click en **"Carga masiva"** → elige el archivo.
8. El sistema muestra un **preview** con:
   - Filas válidas (se van a insertar)
   - Filas con errores (detalle por fila y campo)
9. Si hay errores, corrígelos en el Excel y vuelve a subir.
10. Click en **"Insertar N vehículo(s)"** → los vehículos se crean en la BDD.
11. Después: edita cada vehículo recién creado para agregar imágenes (las imágenes no van en el Excel).

### Editar vehículo

- Click en la tarjeta del vehículo (o el botón "Editar").
- Se abre el mismo formulario con los datos cargados.
- Modifica lo que necesites y click en **"Actualizar"**.

### Marcar como vendido

1. Click en el botón **"Vendido"** (naranja) de la tarjeta.
2. Se abre un diálogo:
   - **Precio final de venta** (puede ser distinto al de lista)
   - **Nombre del comprador**
   - **Notas** (opcional)
3. Click en **"Confirmar Venta"**.
4. El vehículo desaparece del tab Inventario y aparece en el tab **Ventas**.

### Regresar un vehículo al catálogo

Si marcaste por error como vendido:

1. Ve al tab **Ventas**.
2. Click en el botón verde **"Regresar al catálogo"** del vehículo.
3. Se limpian los campos de venta y el vehículo vuelve al inventario activo.

### Pausar / activar vehículo

- Botón **pausar/play** en la tarjeta.
- Un vehículo pausado (inactivo) no aparece en el catálogo público pero sigue existiendo en la BDD.

### Eliminar vehículo

1. Click en el botón **basura** 🗑️.
2. Se abre un diálogo de **confirmación con palabra clave**:
   - Muestra marca, modelo y VIN para confirmar visualmente.
   - Debes escribir exactamente `ELIMINAR` (mayúsculas) en el input.
3. Hasta que no escribas la palabra exacta, el botón rojo **"Eliminar permanentemente"** está deshabilitado.
4. Click en el botón → DELETE definitivo de la BDD.

> ⚠️ La eliminación es **irreversible**. No hay papelera.

---

## 4. Ventas

### Vista general

- Lista de todos los vehículos vendidos, ordenados por fecha de venta (más reciente primero).
- Tarjetas similares al inventario pero con información de venta:
  - **Precio de Venta** (lo que realmente se pagó)
  - **Margen** (precio de venta − precio empleado)
  - **Comprador**
  - **Fecha de venta**
  - **Notas**

### Estadísticas arriba

- **Vendidos** — total de ventas
- **Ingresos Totales** — suma de precios de venta
- **Margen Total** — suma de márgenes (verde si positivo, rojo si negativo)

### Acciones disponibles por venta

- **Regresar al catálogo** — revierte la venta y mueve el vehículo al inventario
- **Eliminar permanentemente** — con la misma confirmación de palabra clave

---

## 5. Usuarios

### Vista general

Lista completa de cuentas registradas con:

- Email
- Rol (Admin / Empleado / Usuario)
- Fecha de creación
- Último acceso
- Badge "Sin confirmar" si el usuario no verificó su correo

### Crear usuario manualmente

1. Click en **"Nuevo Usuario"**.
2. Llena:
   - **Email**
   - **Contraseña** (mínimo 6 caracteres)
   - **Rol:** Empleado o Administrador
3. Click en **"Crear Usuario"**.

> El usuario se crea con el correo ya confirmado automáticamente (no recibe correo de verificación).

### Cambiar rol

1. Click en el icono de engrane ⚙️ del usuario.
2. Selecciona el nuevo rol.
3. Click en **"Guardar"**.

### Resetear contraseña

- Click en el icono de **llave** 🔑.
- El sistema envía un correo de recuperación al usuario.
- El botón queda deshabilitado 5 segundos para evitar spam.

### Eliminar usuario

- Click en el icono **basura**.
- Diálogo de confirmación.
- Click en **"Eliminar"** → se borra el usuario de `auth.users` y `user_roles`.

---

## 6. Dominios

Este tab controla qué **correos corporativos** pueden crear cuenta.

### Cómo funciona

Cuando alguien intenta registrarse en `/registro`, el sistema:

1. Extrae el dominio del correo (ej: `juan@jhl.mx` → `jhl.mx`)
2. Busca el dominio en la tabla `allowed_domains`
3. Si existe → crea la cuenta con rol "Empleado" automáticamente
4. Si NO existe → elimina el usuario y muestra: _"Acceso restringido a colaboradores autorizados"_

### Agregar dominio

1. Escribe el dominio en el input (ej: `nuevaempresa.com`).
2. Click en **"Agregar dominio"** (o Enter).
3. El sistema valida el formato (debe tener TLD válido).
4. Se registra en la tabla.

### Eliminar dominio

1. Click en la basura del dominio.
2. Confirma.
3. A partir de ese momento, nuevos registros con ese dominio son rechazados.

> **Nota:** los usuarios existentes NO se ven afectados al eliminar un dominio. Solo aplica a registros nuevos.

### Dominios iniciales

El sistema arranca con:

- `jhl.mx`
- `creditoexpress.com`
- `scaletechconsulting.com`

---

## 7. Estadísticas rápidas (header)

En la parte superior del panel siempre se muestran:

| Métrica | Cálculo |
|---|---|
| **Total** | Vehículos no vendidos |
| **Activos** | No vendidos y no pausados |
| **Públicos** | Activos con visibilidad pública |
| **Exclusivos** | Activos pero con visibilidad solo para empleados |

---

## 8. Logout

Botón **"Cerrar sesión"** arriba a la derecha. Cierra la sesión y vuelve al sitio público.

---

## 9. Buenas prácticas

1. **No elimines vehículos sin confirmar primero** — la eliminación es permanente. Para quitarlos del catálogo temporalmente, usa el toggle **"Activo"**.
2. **Revisa periódicamente los dominios autorizados** — si un socio o cliente deja de operar contigo, elimina su dominio para cerrar el registro.
3. **Asigna el rol admin solo a personal necesario** — los admins pueden eliminar vehículos, cambiar precios y gestionar otros admins.
4. **Exporta reportes periódicamente** — el tab Ventas muestra el histórico pero si necesitas reportería más profunda, exporta desde Supabase directamente.
5. **Mantén las descripciones de vehículos actualizadas** — son lo que lee el cliente antes de decidir.

---

## 10. Problemas comunes

| Problema | Causa probable | Solución |
|---|---|---|
| No veo el tab "Dominios" | Lovable aún no redeployó | Espera 1-2 min y hard refresh |
| Un vehículo no aparece en catálogo | Inactivo, no público, o fecha de liberación futura | Revisa los 3 toggles y la fecha |
| Error "Marca no permitida" en Excel | Marca con errata | Usa el dropdown del Excel en vez de escribir |
| "No se pudo subir la imagen" | Archivo >5MB o tipo inválido | Redimensiona o convierte a JPG/PNG/WebP |
| El empleado ve precio público en vez de preferencial | No ha iniciado sesión, o su dominio no está en la lista | Verifica sesión activa y que su dominio esté en `allowed_domains` |
