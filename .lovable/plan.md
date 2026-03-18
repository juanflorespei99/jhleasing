

## Corrección del Journey de Compra

### Cambio
Actualizar los 4 pasos en `src/components/VehicleFilters.tsx` (líneas 103-107) con el flujo correcto y descripciones más claras:

```typescript
{ step: "01", title: "Selecciona", desc: "Explora nuestro inventario y elige el vehículo que más se adapte a tus necesidades" },
{ step: "02", title: "Envía tus datos", desc: "Llena el formulario de solicitud de compra con tu información de contacto" },
{ step: "03", title: "Te contactamos", desc: "Nuestro equipo se comunicará contigo para confirmar disponibilidad, resolver dudas y coordinar el pago" },
{ step: "04", title: "Pago y Entrega", desc: "Realiza tu pago de forma segura y recoge tu vehículo listo para rodar" },
```

### Archivo afectado
- `src/components/VehicleFilters.tsx` — solo las líneas 103-107

