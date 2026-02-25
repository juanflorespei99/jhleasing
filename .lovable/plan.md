

# Implementar sistema de usuarios y visibilidad de inventario

## Resumen
Se creara un sistema completo con autenticacion, base de datos de vehiculos en Supabase con Row Level Security (RLS), y logica de doble pricing. Los usuarios publicos solo veran vehiculos publicos con precios publicos. Los empleados autenticados veran todo el inventario con precios preferenciales.

## Arquitectura

```text
+------------------+       +-------------------+       +------------------+
|  Usuario publico |------>| Supabase RLS      |------>| Solo vehiculos   |
|  (no logueado)   |       | (anon role)       |       | is_public = true |
+------------------+       +-------------------+       | precio_publico   |
                                                       +------------------+

+------------------+       +-------------------+       +------------------+
|  Empleado        |------>| Supabase RLS      |------>| TODOS los        |
|  (logueado)      |       | (authenticated)   |       | vehiculos        |
+------------------+       +-------------------+       | precio_empleado  |
                                                       +------------------+
```

## Paso 1: Base de datos en Supabase

### Tabla `vehicles`
Migrar el inventario actual (hardcoded en `src/data/vehicles.ts`) a una tabla en Supabase:

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | uuid (PK) | Identificador unico |
| slug | text (unique) | URL-friendly ID (ej. "chevrolet-aveo-2024") |
| brand | text | Marca |
| name | text | Nombre completo del modelo |
| type | text | Tipo: Sedan, SUV, Blindada |
| year | integer | Ano del modelo |
| price_public | integer | Precio publico en MXN |
| price_employee | integer | Precio preferencial empleado |
| mileage | text | Kilometraje |
| img | text | URL imagen principal |
| images | text[] | Array de URLs de imagenes |
| status | text | Disponible / Vendido |
| vin | text | Numero de serie |
| location | text | Ubicacion |
| description | text | Descripcion del vehiculo |
| is_public | boolean (default true) | Visible para usuarios publicos |
| created_at | timestamptz | Fecha de creacion |

### Tabla `allowed_domains`
Para gestionar los dominios de correo autorizados:

| Columna | Tipo |
|---------|------|
| id | uuid (PK) |
| domain | text (unique) | 
| created_at | timestamptz |

### Tabla `user_roles`
Siguiendo las mejores practicas de seguridad:

| Columna | Tipo |
|---------|------|
| id | uuid (PK) |
| user_id | uuid (FK auth.users) |
| role | app_role enum (admin, employee, user) |

### Politicas RLS en `vehicles`

- **SELECT para todos (anon + authenticated)**: Donde `is_public = true` -- usuarios publicos ven solo inventario publico
- **SELECT para empleados autenticados**: Todos los vehiculos -- usando funcion `has_role()` que verifica rol `employee` o `admin`

### Vista `vehicles_public`
Una vista con `security_invoker=on` que excluye `price_employee` y `vin` para usuarios no autenticados. Los usuarios publicos consultaran esta vista.

### Funcion de validacion de dominio
Un trigger en `auth.users` (via webhook o edge function) que al registrarse un usuario, verifica si su dominio de correo esta en `allowed_domains` y le asigna el rol `employee` automaticamente.

## Paso 2: Edge Function para registro

Se creara una edge function `on-signup` que:
1. Se activa como webhook cuando un usuario se registra
2. Verifica si el dominio del correo esta en `allowed_domains`
3. Si es un dominio permitido, asigna rol `employee` en `user_roles`
4. Si no, asigna rol `user` (acceso publico solamente)

## Paso 3: Autenticacion en el frontend

### Nuevos archivos:
- **`src/pages/Login.tsx`**: Pagina de login con correo y contrasena
- **`src/pages/Register.tsx`**: Pagina de registro
- **`src/hooks/useAuth.ts`**: Hook para manejar estado de autenticacion y rol del usuario
- **`src/components/AuthGuard.tsx`**: Componente para proteger rutas (si se necesita)

### Cambios en archivos existentes:
- **`src/App.tsx`**: Agregar rutas `/login` y `/registro`, envolver con contexto de autenticacion
- **`src/pages/Index.tsx`**: 
  - Reemplazar datos hardcoded por consulta a Supabase
  - Mostrar precio segun tipo de usuario
  - Agregar boton de login/logout en la navegacion
  - Usuarios publicos: consultan vista `vehicles_public` (sin precio empleado)
  - Empleados: consultan tabla `vehicles` directamente (ven ambos precios)
- **`src/pages/VehicleDetail.tsx`**: Misma logica de precios y visibilidad
- **`src/data/vehicles.ts`**: Se mantendra como fallback/seed pero la fuente principal sera Supabase

## Paso 4: UX de precios para empleados

Cuando un empleado ve un vehiculo publico:
- Se muestra el **precio empleado** como precio principal
- Se muestra el precio publico tachado como referencia
- Etiqueta "Precio preferencial" visible

Cuando un empleado ve un vehiculo exclusivo (no publico):
- Solo se muestra el precio empleado
- Etiqueta "Exclusivo empleados" visible

## Paso 5: Navegacion actualizada

- Agregar boton "Iniciar Sesion" en la barra de navegacion para usuarios no logueados
- Mostrar nombre/avatar del usuario y boton "Cerrar Sesion" para usuarios logueados
- Badge o indicador visual cuando el usuario tiene acceso de empleado

## Orden de implementacion

1. Migracion SQL: crear tablas `vehicles`, `allowed_domains`, `user_roles`, enum `app_role`, funcion `has_role()`, politicas RLS, vista `vehicles_public`
2. Insertar los 9 vehiculos actuales en la tabla `vehicles`
3. Crear edge function `on-signup` para asignacion automatica de roles
4. Implementar hook `useAuth` y contexto de autenticacion
5. Crear paginas de Login y Registro
6. Actualizar Index.tsx y VehicleDetail.tsx para consumir datos de Supabase
7. Actualizar navegacion con login/logout
