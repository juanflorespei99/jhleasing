

# Plan: Panel de Administración JH Leasing

## 1. Migración de Base de Datos

Agregar 3 columnas nuevas a `vehicles`:
- `release_at_public` (timestamptz, nullable) — fecha de liberación pública
- `is_active` (boolean, default true) — pausar sin borrar
- `created_by` (uuid, nullable) — referencia al admin creador

Agregar RLS policies para INSERT/UPDATE/DELETE en `vehicles` solo para admins.

Actualizar la vista `vehicles_public` para incluir `release_at_public <= NOW()` y `is_active = true`.

Insertar dominios `jhl.mx` y `creditoexpresss.com` en `allowed_domains`.

## 2. Restricción de Registro

Actualizar `Register.tsx` para validar el dominio del correo en el frontend antes de llamar `signUp()`. Si no es `@jhl.mx` o `@creditoexpresss.com`, mostrar error "Acceso restringido a colaboradores autorizados".

Actualizar la Edge Function `on-signup` para también rechazar dominios no permitidos (doble validación server-side).

## 3. Panel de Administración `/admin`

### Archivos nuevos:
- `src/pages/Admin.tsx` — layout principal con sidebar usando componentes de shadcn
- `src/components/admin/VehicleTable.tsx` — tabla con inventario completo, badges de estado (Público/Exclusivo/Inactivo), margen de beneficio empleado
- `src/components/admin/VehicleForm.tsx` — formulario para crear/editar vehículos con:
  - Select de Marca y Tipo (shadcn Select)
  - Inputs numéricos para `price_public` y `price_employee`
  - Cálculo visual del margen de beneficio (diferencia y %)
  - DatePicker para `release_at_public` (shadcn Calendar + Popover)
  - Upload de imágenes al bucket `vehicle-images`
  - Toggle para `is_public` e `is_active`

### Ruta protegida:
- Agregar `/admin` en `App.tsx`
- Componente `AdminGuard` que verifica `role === 'admin'` vía `useAuth()`, redirige a `/` si no

### Funcionalidades de la tabla:
- Columnas: Imagen, Nombre, Marca, Tipo, Año, Precio Público, Precio Empleado, Margen, Estado, Acciones
- Badges: verde "Público", azul "Exclusivo Empleado", gris "Inactivo"
- Botones de editar/desactivar por fila
- Barra superior con botón "Nuevo Vehículo" que abre dialog/modal con el formulario

### Upload de imágenes:
- Usar el bucket existente `vehicle-images` (ya público)
- Subir vía `supabase.storage.from('vehicle-images').upload()`
- Obtener URL pública con `getPublicUrl()`
- Permitir múltiples imágenes, primera = thumbnail (`img`)

## 4. Lógica de Precios (Margen)

En la tabla y formulario del admin:
- Mostrar columna "Margen" = `price_public - price_employee`
- Mostrar porcentaje: `((price_public - price_employee) / price_public * 100).toFixed(1)%`
- Destacar con color primario (Euphorbia)

## 5. Actualizar Catálogo Público

Modificar `fetchVehicles` en `Index.tsx` para la vista pública: filtrar por `is_active = true` y `release_at_public <= now()` (esto se manejará desde la vista SQL actualizada).

## Orden de implementación:

1. Migración SQL (columnas + RLS + vista actualizada + dominios)
2. Actualizar Edge Function `on-signup`
3. Actualizar `Register.tsx` con validación de dominio
4. Crear componentes admin (`AdminGuard`, `VehicleTable`, `VehicleForm`)
5. Crear página `Admin.tsx` y agregar ruta en `App.tsx`
6. Actualizar tipos TypeScript (automático tras migración)

## Detalle técnico de la migración SQL

```text
ALTER TABLE vehicles
  ADD COLUMN release_at_public timestamptz,
  ADD COLUMN is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN created_by uuid;

-- Admin CRUD policies
CREATE POLICY "Admins can insert vehicles"
  ON vehicles FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicles"
  ON vehicles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicles"
  ON vehicles FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Recrear vista pública con filtros de visibilidad
CREATE OR REPLACE VIEW vehicles_public
  WITH (security_invoker = on) AS
  SELECT id, slug, brand, name, type, year, price_public,
         img, images, status, mileage, location, description,
         is_public, created_at
  FROM vehicles
  WHERE is_public = true
    AND is_active = true
    AND (release_at_public IS NULL OR release_at_public <= NOW());

-- Insertar dominios permitidos
INSERT INTO allowed_domains (domain) VALUES ('jhl.mx'), ('creditoexpresss.com')
  ON CONFLICT DO NOTHING;
```

