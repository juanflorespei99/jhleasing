# Lista completa de funcionalidades

Inventario detallado de todo lo que el sistema hace.

---

## 🌐 Sitio público

### Página de inicio (`/`)

- [x] Hero con video de fondo
- [x] Navegación persistente con logo y acceso a login
- [x] Sección de vehículos destacados
- [x] Filtros rápidos por tipo de vehículo
- [x] Filtros por marca (con logos oficiales)
- [x] Slider de precio máximo
- [x] Footer con enlaces a aviso y política de privacidad

### Catálogo completo (`/inventario`)

- [x] Grid de tarjetas de vehículos
- [x] Filtro por tipo (SUV, Sedán, Hatchback, Pick-up, Van, Coupé, Blindados)
- [x] Filtro por marca con logos clickeables (26+ marcas)
- [x] Slider de rango de precio
- [x] Estado visual cuando un filtro está activo
- [x] Vista responsive (desktop/tablet/móvil)

### Detalle de vehículo (`/vehiculo/:slug`)

- [x] Galería de imágenes con **lightbox** (zoom, drag, navegación con flechas, Esc para cerrar)
- [x] Fallback para vehículos sin imágenes
- [x] Ficha técnica: año, tipo, kilometraje, ubicación, color, estado de placas
- [x] Descripción
- [x] Precio diferenciado según sesión (público vs preferencial)
- [x] Botón "Solicitar Compra"
- [x] Botón "Comparar"
- [x] Botón "Volver al catálogo"
- [x] Badge "Blindado" si aplica

### Comparador (`/comparar`)

- [x] Selector de hasta 3 vehículos
- [x] Fichas lado a lado
- [x] Comparación visual de precios, km, año, etc.

### Solicitud de compra (`/solicitar-compra/:slug`)

- [x] Tarjeta del vehículo con precio (diferenciado según usuario)
- [x] Formulario embebido de **HubSpot** para contacto comercial
- [x] VIN enviado automáticamente al formulario (oculto al usuario)
- [x] iframe responsive

---

## 🔐 Autenticación

### Registro (`/registro`)

- [x] Validación de formato de correo con regex
- [x] Validación de contraseña (mínimo 6 caracteres, confirmación)
- [x] Detección de contraseñas débiles (vía Supabase)
- [x] **Whitelist de dominios** — solo dominios en `allowed_domains` pueden registrarse
- [x] Asignación automática de rol **Empleado** al registrarse
- [x] Correo de confirmación enviado automáticamente
- [x] Eliminación automática de usuarios con dominios no autorizados

### Login (`/login`)

- [x] Email + contraseña
- [x] Detección de errores claros (credenciales inválidas, correo no confirmado, etc.)
- [x] Redirección automática después de login exitoso
- [x] Enlace a "Olvidé mi contraseña"

### Recuperación de contraseña

- [x] Input de correo en login
- [x] Envío de link de recuperación (vigencia 24h)
- [x] Página `/reset-password` que valida el token
- [x] Formulario para nueva contraseña con validación
- [x] Redirección automática a login tras actualizar

### Logout

- [x] Botón "Cerrar sesión" en toda página autenticada
- [x] Limpieza de sesión en Supabase + localStorage

---

## 🛠 Panel administrativo (`/admin`)

### Tab Inventario

- [x] Listado completo de vehículos no vendidos
- [x] Estadísticas rápidas (total, activos, públicos, exclusivos, vendidos)
- [x] Barra de búsqueda por nombre/marca/VIN/ubicación
- [x] Botón **"Plantilla"** — descarga Excel con dropdowns
- [x] Botón **"Carga masiva"** — sube Excel lleno con preview de errores
- [x] Botón **"Nuevo Vehículo"** — formulario modal
- [x] Formulario con 16 campos (marca, tipo, modelo, año, precios, km, VIN, color, estado, ubicación, descripción, fecha liberación, 3 toggles)
- [x] **Combobox de marca** — selecciona del catálogo o escribe marca personalizada
- [x] **Upload de logo** para marcas personalizadas (PNG/JPG/WebP, máx 2MB)
- [x] Upload múltiple de imágenes con validación (tipo y tamaño)
- [x] Subida en paralelo con manejo de fallos parciales
- [x] Cálculo automático de margen en el formulario
- [x] Calendario para fecha de liberación pública
- [x] Editar vehículo (mismo formulario)
- [x] Botón "Vendido" con diálogo de registro de venta
- [x] Botón pausar/activar vehículo
- [x] Botón basura con **confirmación por palabra clave "ELIMINAR"**

### Tab Ventas

- [x] Histórico de vehículos vendidos
- [x] Estadísticas: total vendidos, ingresos totales, margen total
- [x] Ordenado por fecha de venta (más reciente primero)
- [x] Tarjeta por venta con: precio venta, margen, comprador, fecha, notas
- [x] Botón **"Regresar al catálogo"** — revierte la venta
- [x] Botón basura con confirmación por palabra clave

### Tab Usuarios

- [x] Listado de todos los usuarios
- [x] Búsqueda por correo o rol
- [x] Badges de rol (Admin, Empleado, Usuario)
- [x] Indicador visual "Sin confirmar" para correos no verificados
- [x] Crear usuario con email, contraseña y rol (auto-confirmado)
- [x] Cambiar rol de usuario
- [x] Resetear contraseña (envío de correo, con rate limit)
- [x] Eliminar usuario con confirmación

### Tab Dominios

- [x] Listado de dominios autorizados para registro
- [x] Agregar dominio con validación de formato
- [x] Buscar dominios
- [x] Eliminar dominio con advertencia de impacto
- [x] Banner informativo sobre cómo funciona

### Protección de rutas

- [x] `<AdminGuard>` a nivel de Route (sin flash de UI)
- [x] Redirección automática si no eres admin
- [x] Verificación server-side en edge functions (JWT + rol)

---

## 💰 Sistema de precios

- [x] `price_public` — visible para todos
- [x] `price_employee` — 30% descuento, visible solo para empleados autenticados
- [x] Cálculo automático de margen en admin (`public − employee`)
- [x] Display diferenciado en tarjetas, detalle y página de compra
- [x] Precio preferencial con el público tachado debajo (visual clara)

---

## 📥 Carga masiva (Excel)

- [x] Plantilla descargable con headers + 2 filas de ejemplo
- [x] Hoja "Instrucciones" con referencia de valores válidos
- [x] Dropdowns en 7 columnas (Marca, Tipo, Color, Estado de Placas, Blindado, Público, Activo)
- [x] Parser que valida:
  - Campos obligatorios (marca, modelo, tipo)
  - Tipos y enums (color, estado de placas)
  - Rangos de año (1980 a actual + 2)
  - Precios no negativos
  - Formato de fecha (YYYY-MM-DD)
  - Booleanos flexibles (Sí/No/true/false/1/0)
- [x] **Marcas personalizadas** aceptadas (no falla por marca desconocida)
- [x] Preview con filas válidas e inválidas
- [x] Inserción en bloque (`insert([...])`)
- [x] Defaults inteligentes para campos opcionales

---

## 🖼 Marcas y logos

- [x] 26 marcas predefinidas con logos SVG (Audi, BMW, Chevrolet, Chirey, Chrysler, Dodge, Ford, GMC, Honda, Hyundai, JAC, Jeep, KIA, Land Rover, Mazda, Mercedes, MG, Mini, Nissan, Peugeot, Renault, SEAT, Suzuki, Toyota, Volkswagen, Volvo)
- [x] Logos reales (descargados de Simple Icons / Wikimedia)
- [x] Fallback a texto si una marca no tiene logo
- [x] Tabla `brand_logos` para marcas personalizadas
- [x] Storage bucket `brand-logos` (public read, admin write)
- [x] Upload con validación (tipo, tamaño)
- [x] Merge automático de logos hardcoded + custom

---

## 🛡️ Seguridad

- [x] **Row Level Security (RLS)** habilitada en todas las tablas
- [x] Políticas específicas por rol (anon, authenticated, admin)
- [x] **Column-level GRANTs** en `vehicles` (anon no ve columnas sensibles)
- [x] Vistas `vehicles_public` y `vehicles_employee` que filtran columnas
- [x] Revocación de acceso directo de anon a tabla vehicles
- [x] **Edge functions con verificación JWT + rol server-side**:
  - `manage-users` — solo admin
  - `upload-vehicle-image` — solo admin/empleado
  - `on-signup` — verifica firma de webhook
  - `cleanup-unconfirmed` — cron job con secret
- [x] Validación de MIME types y tamaño en uploads
- [x] Whitelist de dominios en registro
- [x] VIN protegido — fetch vía RPC `get_vehicle_vin` (SECURITY DEFINER)
- [x] Credenciales Supabase son anon/publishable key (diseñada para ser pública)
- [x] `.env` excluido de git
- [x] Confirmación por palabra clave para acciones destructivas

---

## 📱 UX / UI

- [x] Diseño **neumórfico** consistente (neu-card, neu-tag, etc.)
- [x] Paleta coherente (brand-spellbound, brand-euphorbia, etc.)
- [x] Responsive en mobile, tablet y desktop
- [x] Toasts informativos con **sonner** para todas las acciones
- [x] Loading states en cada página/fetch
- [x] Error states con mensajes claros
- [x] Skeletons/spinners mientras se carga
- [x] Meta tags SEO (title, description, OG, Twitter card)
- [x] Fuente Helvetica Neue global

---

## 🧩 Integraciones

| Integración | Uso |
|---|---|
| **Supabase** | Auth + DB + Storage + Edge Functions |
| **HubSpot** | Formulario de solicitud de compra (iframe) |
| **Lovable** | Hosting y sincronización de código |

---

## 🚀 Performance

- [x] Imágenes con lazy loading (nativo del browser)
- [x] Lista de vehículos cacheada con **TanStack Query**
- [x] Supabase client con `persistSession + autoRefreshToken`
- [x] Bundle optimizado con Vite

---

## 🧪 Pruebas

- [x] Setup de **Vitest** + **Testing Library**
- [x] `jsdom` para pruebas de componentes
- [ ] Suite de tests completa (pendiente — deuda técnica)
