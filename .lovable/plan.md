

## Agregar "Blindada" como tipo de vehículo

**Problema**: La lista de tipos en el formulario admin (`VehicleForm.tsx`) no incluye "Blindada", por lo que no se puede asignar ese tipo a los vehículos blindados. El filtro "Blindada" en el inventario busca `v.type === "Blindada"` pero ningún vehículo tiene ese tipo.

**Cambio**:
- **`src/components/admin/VehicleForm.tsx` línea 20**: Agregar `"Blindada"` al array `TYPES`:
  ```ts
  const TYPES = ["SUV", "Sedán", "Hatchback", "Pick-up", "Van", "Coupé", "Blindada"];
  ```

**Nota**: Los vehículos blindados existentes en la base de datos deberán editarse desde el panel admin para cambiar su tipo a "Blindada". El build error mostrado es un error temporal de infraestructura (S3 upload), no relacionado con el código.

