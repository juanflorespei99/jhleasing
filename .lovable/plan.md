

## Probar con valor fijo en el campo numero_de_serie

### Objetivo
Enviar un valor corto y fijo (ej. `"TEST123"`) en lugar del VIN dinámico para descartar que el problema sea el tipo de campo, la longitud del valor, o el RPC de Supabase.

### Cambio

**Archivo: `src/pages/PurchaseRequest.tsx`**

En la línea donde se define `serialNumber` dentro del segundo `useEffect`, reemplazar:
```ts
const serialNumber = vin;
```
por:
```ts
const serialNumber = "TEST123";
```

Esto es temporal — solo para confirmar si HubSpot recibe el dato. Si `TEST123` aparece en el ticket de HubSpot, sabremos que la inyección funciona y el problema está en el valor dinámico o su timing. Si no aparece, el problema es de cómo HubSpot procesa el campo oculto.

### Después del test
- Si **llega** `TEST123`: volvemos a poner `vin` y revisamos el timing/valor del RPC.
- Si **no llega**: el problema es que HubSpot no está recogiendo el valor del input aunque se escriba, y hay que escalar con ellos.

