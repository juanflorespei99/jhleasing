
Objetivo: corregir de forma directa el flujo para que el formulario de compra envíe siempre el Serial Number real del coche seleccionado.

Contexto confirmado:
- El Nissan Versa sí existe en la BDD con:
  - slug: `nissan-versa-2024`
  - vin: `3N1CN8DV0RL000003`
- La página `/solicitar-compra/:slug` ya está trayendo el VIN con `get_vehicle_vin`.
- Por tanto, el problema no es “jalar el dato” desde Supabase; el problema está en el último tramo: cómo HubSpot recibe ese valor.

Plan de implementación:
1. Mantener el origen actual del dato
   - Seguir usando el `slug` del vehículo seleccionado.
   - Seguir obteniendo el VIN por RPC (`get_vehicle_vin`) para respetar seguridad y RLS.

2. Endurecer la integración con HubSpot
   - Reemplazar la lógica frágil basada solo en un selector fijo por una estrategia más robusta:
     - esperar explícitamente a que el formulario esté listo,
     - localizar el campo real de Serial Number que HubSpot renderiza,
     - asignarle el VIN,
     - disparar los eventos necesarios para que HubSpot lo registre internamente.

3. Corregir el punto más probable del fallo
   - Verificar y ajustar el selector del campo.
   - Ahora mismo el código asume `input[name="numero_de_serie"]`, pero por la evidencia el campo visible no está quedando poblado; eso apunta a que el `name` real renderizado por HubSpot no coincide exactamente o cambia en runtime.
   - Haré la lógica tolerante a variantes del campo en vez de depender de una sola coincidencia rígida.

4. Forzar el valor en dos momentos
   - Al cargar el formulario (`onFormReady`).
   - Justo antes del envío (`onFormSubmit`).
   - Así evitamos que HubSpot “pierda” el valor aunque rehidrate o reprocese el form internamente.

5. Añadir una verificación visible durante desarrollo
   - Incluir una comprobación local no invasiva para confirmar que el VIN obtenido por `slug` es el correcto antes de pasarlo a HubSpot.
   - Esto permite separar claramente “dato cargado” de “dato enviado”.

6. Mantener el resto del flujo intacto
   - No cambiar rutas ni navegación.
   - No tocar la BDD ni funciones SQL.
   - No cambiar el proceso de reserva (`reserve_vehicle`), salvo conservarlo como está después del envío exitoso.

Resultado esperado:
- Si el usuario entra al Nissan Versa y pulsa “Solicitar compra”, el formulario debe enviar `3N1CN8DV0RL000003`.
- Si entra a otro coche, debe enviarse el VIN único de ese otro coche, sin valores fijos ni manuales.

Detalles técnicos:
- Archivo principal a ajustar: `src/pages/PurchaseRequest.tsx`
- No hacen falta cambios en Supabase para esta corrección.
- La parte crítica será sustituir la asignación “me apoyo en un único selector” por una integración más robusta con el formulario ya renderizado.
- La validación final debe hacerse en el dominio publicado, porque HubSpot puede comportarse distinto en preview.
