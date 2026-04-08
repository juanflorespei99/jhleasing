# JH Leasing

Plataforma web para la gestión y exhibición del inventario de vehículos de JH Leasing, con un panel administrativo para empleados y precios diferenciados (público vs. empleado).

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (componentes basados en Radix)
- **React Router** para navegación
- **TanStack Query** para data fetching y caché
- **Supabase** para autenticación, base de datos y storage
- **Vitest** + **Testing Library** para pruebas

## Características principales

- Catálogo público de vehículos con filtros (marca, año, tipo de carrocería, etc.)
- Detalle de vehículo con galería de imágenes y lightbox
- Comparador de vehículos lado a lado
- Solicitud de compra
- Autenticación con roles: `user`, `employee`, `admin`
- Panel administrativo (`/admin`):
  - Alta, edición y marcado como vendido del inventario
  - Gestión de usuarios y roles
  - Dashboard de ventas
- Precios diferenciados: público vs. empleado (vista `vehicles_employee`)

## Requisitos

- Node.js 18+ (recomendado 20+)
- Una cuenta de Supabase con el proyecto provisionado (ver carpeta `supabase/`)

## Configuración

1. Clona el repositorio:
   ```sh
   git clone https://github.com/juanflorespei99/jhleasing.git
   cd jhleasing
   ```

2. Instala dependencias:
   ```sh
   npm install
   ```

3. Copia el archivo de variables de entorno y rellénalo con los valores de tu proyecto Supabase:
   ```sh
   cp .env.example .env
   ```

   Edita `.env` con tus credenciales:
   ```env
   VITE_SUPABASE_PROJECT_ID="..."
   VITE_SUPABASE_URL="https://xxxxx.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
   ```

   > La `PUBLISHABLE_KEY` es la clave **anon/public** de Supabase. Es segura para exponer en el cliente porque las tablas están protegidas por Row Level Security (RLS).

4. Levanta el servidor de desarrollo:
   ```sh
   npm run dev
   ```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo desarrollo |
| `npm run preview` | Previsualizar el build de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run test` | Correr tests con Vitest |
| `npm run test:watch` | Tests en modo watch |

## Estructura del proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── components/          # Componentes React
│   ├── admin/           # Componentes del panel admin
│   ├── auth/            # Componentes de autenticación
│   └── ui/              # Componentes shadcn/ui
├── data/                # Datos estáticos (marcas, etc.)
├── hooks/               # Custom hooks (useAuth, useVehicles, ...)
├── integrations/
│   └── supabase/        # Cliente Supabase y tipos generados
├── lib/                 # Utilidades (formato, recovery, ...)
├── pages/               # Páginas de rutas
├── test/                # Setup y ejemplos de tests
└── types/               # Tipos TypeScript compartidos

supabase/                # Migraciones y funciones edge
```

## Despliegue

El proyecto está conectado a Lovable. Los cambios pueden hacerse desde:
- La interfaz de Lovable (sincroniza automáticamente con este repo)
- Tu IDE local (haz push y Lovable lo refleja)

Para publicar: en Lovable → **Share → Publish**.
