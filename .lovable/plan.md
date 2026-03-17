

## Todos los usuarios activados = empleados

**Problema actual**: Solo los usuarios con rol `employee` o `admin` en `user_roles` ven todos los vehículos con precios preferenciales. Un usuario autenticado sin rol en esa tabla se trata como "user" y no ve nada (por falta de política RLS).

**Solución**: Dos cambios — uno en RLS (base de datos) y otro en el código frontend.

### 1. Nueva política RLS en `vehicles`
Agregar una política que permita a **cualquier usuario autenticado** leer **todos** los vehículos (sin filtro de `is_public`/`is_active`):

```sql
CREATE POLICY "All authenticated users see all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (true);
```

También eliminar la política actual "Employees see all vehicles" que ya sería redundante.

### 2. Cambio en `useAuth.tsx`
Modificar `isEmployee` para que cualquier usuario autenticado sea considerado empleado:

```typescript
// Antes:
const isEmployee = role === "employee" || role === "admin";

// Después:
const isEmployee = !!user;
```

Esto hace que cualquier usuario con sesión activa vea todos los vehículos, precios de empleado y badges exclusivos — sin depender de la tabla `user_roles`.

### Archivos a modificar
- **Migración SQL** — nueva política RLS + eliminar la anterior restrictiva
- **`src/hooks/useAuth.tsx`** — línea ~87: cambiar condición de `isEmployee`

