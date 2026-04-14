# Manual de Usuario

Guía para **empleados, colaboradores y usuarios finales** del sitio JH Leasing.

---

## 1. Navegación general

| Página | URL | Acceso |
|---|---|---|
| Inicio | `/` | Público |
| Catálogo completo | `/inventario` | Público |
| Detalle de vehículo | `/vehiculo/{slug}` | Público |
| Comparador | `/comparar` | Público |
| Solicitar compra | `/solicitar-compra/{slug}` | Público |
| Iniciar sesión | `/login` | Público |
| Crear cuenta | `/registro` | Solo dominios autorizados |
| Recuperar contraseña | `/reset-password` | Via correo |

---

## 2. Crear cuenta como empleado/colaborador

### Requisitos

- Debes usar un correo de un **dominio corporativo autorizado** (por ejemplo `@jhl.mx`, `@creditoexpress.com`).
- Contraseña mínima: **6 caracteres**.

### Pasos

1. En la parte superior derecha, click en **"Iniciar Sesión"**.
2. En la pantalla de login, click en **"Crear cuenta"** (enlace debajo del formulario).
3. Ingresa tu correo corporativo y una contraseña.
4. Confirma la contraseña.
5. Click en **"Crear cuenta"**.
6. Revisa tu correo — recibirás un **link de confirmación**. Click en el link para activar la cuenta.
7. Regresa al sitio y haz login normalmente.

### Problemas comunes

| Error | Causa | Solución |
|---|---|---|
| "Acceso restringido a colaboradores autorizados" | Tu dominio no está en la lista | Contacta al admin para que lo agregue |
| "Correo inválido" | Formato incorrecto | Verifica que sea `nombre@dominio.com` |
| "La contraseña es muy común" | Supabase detectó una contraseña débil | Usa una más compleja |
| No llega el correo de confirmación | Puede estar en spam | Revisa carpeta de spam; si no, pide al admin que confirme manualmente |

---

## 3. Iniciar sesión

1. Click en **"Iniciar Sesión"** (arriba a la derecha del sitio).
2. Ingresa correo y contraseña.
3. Click en **"Ingresar"**.

Una vez autenticado, verás:

- Tu botón cambia a **"Cerrar sesión"**.
- En el catálogo e inventario aparecen los **precios preferenciales** (30% descuento) con el precio público tachado.
- Si eres admin, aparece el enlace a `/admin`.

---

## 4. Recuperar contraseña

1. En la pantalla de login, click en **"¿Olvidaste tu contraseña?"**.
2. Ingresa tu correo corporativo.
3. Click en **"Enviar link de recuperación"**.
4. Revisa tu correo — el link dura **24 horas** activo.
5. Click en el link → te lleva a una página para crear una nueva contraseña.
6. Ingresa la nueva contraseña dos veces → click en **"Actualizar contraseña"**.

---

## 5. Explorar el catálogo

### Sección Inicio (`/`)

- Video en hero con llamado a acción.
- Vista previa de vehículos destacados.
- Filtros rápidos por tipo (SUV, Sedán, Pick-up, etc.) y por marca.
- Rango de precio ajustable.

### Catálogo completo (`/inventario`)

- Todas las tarjetas de vehículos disponibles.
- Filtros en la barra superior:
  - **Tipo:** SUV, Sedán, Hatchback, Pick-up, Van, Coupé, Blindados
  - **Marca:** 26+ marcas con logos (click en el logo para filtrar)
  - **Precio máximo:** slider ajustable
- Cada tarjeta muestra:
  - Foto principal
  - Marca + modelo + año
  - Precio público (o preferencial si eres empleado)
  - Tipo de vehículo
  - Kilometraje
  - Ubicación

---

## 6. Ver detalle de un vehículo

Click en cualquier tarjeta → te lleva a `/vehiculo/{slug}`.

### Contenido

- **Galería de imágenes** con zoom (lightbox) — click en cualquier foto para verla en grande
- **Navegación con teclado** dentro del lightbox (← → para cambiar, Esc para cerrar)
- **Precio** (público o preferencial según tu sesión)
- **Ficha técnica:** año, tipo, kilometraje, ubicación, color, estado de placas
- **Descripción** del vehículo
- **Botón "Solicitar Compra"** → te lleva al formulario de HubSpot

### Comparador

Desde el detalle, puedes añadir hasta **3 vehículos** al comparador. Click en el botón comparar → se abre `/comparar` con las fichas lado a lado.

---

## 7. Solicitar compra de un vehículo

1. En el detalle del vehículo, click en **"Solicitar Compra"**.
2. Te lleva a `/solicitar-compra/{slug}`.
3. Verás:
   - A la izquierda: tarjeta con foto, modelo, año y **precio** (preferencial si eres empleado).
   - A la derecha: **formulario de HubSpot** embebido.
4. Llena el formulario con tus datos de contacto.
5. Click en **"Enviar"**.
6. El equipo comercial de JH Leasing se contacta contigo para cerrar la venta.

> **Nota técnica:** el VIN/Serial del vehículo se envía automáticamente al formulario de HubSpot (oculto al usuario) para agilizar el seguimiento interno.

---

## 8. Comparar vehículos

1. Desde el detalle de un vehículo, click en **"Comparar"**.
2. Se abre `/comparar`.
3. Selecciona hasta 3 vehículos del dropdown.
4. Ve las fichas técnicas lado a lado.

---

## 9. Privacidad y términos

En el footer del sitio hay dos enlaces:

- **Aviso de Privacidad** → abre `jhl.mx/aviso-de-privacidad#tab-1`
- **Política de Privacidad** → abre `jhl.mx/aviso-de-privacidad#tab-2`

Ambos se abren en pestaña nueva para no interrumpir la navegación.

---

## 10. Preguntas frecuentes

**¿Puedo crear cuenta con un correo personal (gmail, hotmail)?**
No. Solo correos de dominios corporativos autorizados pueden registrarse.

**¿Por qué veo precios diferentes a los de mi compañero?**
Los precios preferenciales solo se muestran a empleados autenticados. Asegúrate de haber iniciado sesión.

**¿Cómo sé si soy admin?**
Si eres admin, al iniciar sesión verás un enlace a `/admin` en el menú superior. También puedes navegar directamente a `/admin`.

**Intenté crear cuenta con mi correo corporativo y me rechazó.**
Tu dominio puede no estar en la lista. Contacta al admin para que lo agregue en el panel de **Dominios**.

**¿Mi contraseña está segura?**
Sí. Supabase la almacena con hashing bcrypt. Nunca vemos tu contraseña en texto plano.
