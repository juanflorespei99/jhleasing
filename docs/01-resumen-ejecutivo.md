# Resumen Ejecutivo

## ¿Qué es JH Leasing?

Plataforma web propia para la **venta directa de vehículos de flotilla corporativa** con precios diferenciados:

- **Precio Público** — visible para todos los visitantes del sitio.
- **Precio Preferencial (Empleado)** — **30% de descuento** sobre el precio público, visible solo para empleados autenticados con correos de dominios autorizados.

---

## Problema que resuelve

JH Leasing necesitaba un canal digital para liquidar su flotilla corporativa sin depender de intermediarios, ofreciendo un precio preferencial a sus colaboradores y a empresas socias, con control administrativo total sobre el inventario, precios y ventas.

---

## Público objetivo

| Segmento | Acceso | Qué ven |
|---|---|---|
| **Visitantes anónimos** | Sin cuenta | Catálogo público con precios públicos |
| **Empleados / colaboradores** | Cuenta con correo de dominio autorizado | Precios preferenciales (30% descuento) |
| **Administradores** | Rol "admin" | Panel completo: inventario, ventas, usuarios, dominios |

---

## Componentes del sistema

1. **Sitio público** (`/`, `/inventario`, `/vehiculo/:slug`)
   Catálogo, detalle de vehículo, comparador, solicitud de compra vía HubSpot.

2. **Panel administrativo** (`/admin`)
   Gestión de inventario, registro de ventas, administración de usuarios y dominios autorizados.

3. **Sistema de autenticación**
   Registro restringido a dominios corporativos (jhl.mx, creditoexpress.com, etc.), login, recuperación de contraseña.

4. **Sistema de carga masiva**
   Plantilla Excel descargable con menús desplegables y validaciones para alta de vehículos en lote.

---

## Tecnología resumida

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Integraciones:** HubSpot (formulario de compra), Supabase Storage (imágenes)
- **Hosting / sincronización:** Lovable

_Detalles completos en [05-tecnologia.md](./05-tecnologia.md)._

---

## Características clave

| Característica | Descripción |
|---|---|
| 🔐 Seguridad por diseño | Row Level Security (RLS), verificación server-side, dominios autorizados |
| 💰 Precios diferenciados | Visibilidad de precio según el rol del usuario |
| 📊 Panel administrativo completo | Inventario + ventas + usuarios + dominios |
| 📥 Carga masiva Excel | Plantilla con dropdowns y validación previa |
| 🏷️ Marcas personalizables | Upload de logo para marcas fuera del catálogo |
| 📱 Diseño responsive | Funciona en desktop, tablet y móvil |
| 🛡️ Eliminación segura | Confirmación con palabra clave para acciones destructivas |
| 🔄 Auditoría de ventas | Historial completo de vehículos vendidos con márgenes |

---

## Estado del proyecto

| Ítem | Estado |
|---|---|
| Desarrollo | ✅ Completado |
| Seguridad (RLS, auth, roles) | ✅ Implementado y auditado |
| Panel administrativo | ✅ Funcional |
| Carga masiva Excel | ✅ Funcional |
| Gestión de dominios | ✅ Funcional |
| Documentación | ✅ Completada (este paquete) |
| Despliegue en producción | ✅ Publicado |

---

## Escalabilidad y próximos pasos sugeridos

| Prioridad | Sugerencia |
|---|---|
| Media | Implementar TypeScript strict mode |
| Media | Suite de pruebas automatizadas (Vitest + Testing Library) |
| Baja | Alertas por email cuando se registra una venta |
| Baja | Dashboard con gráficas de ventas mensuales |
| Baja | Exportación de inventario a Excel |
