# Documentación Técnica

Detalle del stack, arquitectura y decisiones técnicas de JH Leasing.

---

## 1. Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **Vite** | 5.4 | Build tool + dev server |
| **React** | 18.3 | Framework de UI |
| **TypeScript** | 5.8 | Tipado estático |
| **React Router** | 6.30 | Navegación SPA |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **shadcn/ui** | — | Componentes (Radix UI) |
| **Radix UI** | Varios | Primitivos accesibles |
| **lucide-react** | 0.462 | Iconos |
| **TanStack Query** | 5.83 | Cache y sincronización de datos |
| **react-hook-form** | 7.61 | Manejo de formularios |
| **zod** | 3.25 | Validación de esquemas |
| **date-fns** | 3.6 | Formateo de fechas |
| **sonner** | 1.7 | Toasts |
| **recharts** | 2.15 | Gráficas (futuro) |

### Excel / archivos

| Tecnología | Versión | Uso |
|---|---|---|
| **ExcelJS** | 4.4 | Generación de plantilla Excel con dropdowns |
| **xlsx (SheetJS)** | 0.18.5 | Parseo de archivos Excel subidos |

### Backend / BaaS

| Tecnología | Uso |
|---|---|
| **Supabase** | PostgreSQL + Auth + Storage + Edge Functions |
| **Deno** | Runtime de edge functions |

### Testing

| Tecnología | Versión |
|---|---|
| **Vitest** | 3.2 |
| **Testing Library** | 16.0 |
| **jsdom** | 20.0 |

### Linter / formato

| Tecnología | Versión |
|---|---|
| **ESLint** | 9.32 |
| **typescript-eslint** | 8.38 |

---

## 2. Arquitectura general

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (React SPA)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │   Pages  │  │Components│  │  Hooks │  │   Lib    │  │
│  │ (routes) │  │  (UI)    │  │(logic) │  │(utils)   │  │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘  │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │ supabase-js client
                          │
┌─────────────────────────▼───────────────────────────────┐
│                      SUPABASE                           │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │   Auth   │  │PostgreSQL│  │Storage │  │   Edge   │  │
│  │  (JWT)   │  │  (+RLS)  │  │(buckets│  │Functions │  │
│  │          │  │          │  │        │  │  (Deno)  │  │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ iframe
                          ▼
                  ┌───────────────┐
                  │    HubSpot    │
                  │(purchase form)│
                  └───────────────┘
```

---

## 3. Estructura del repositorio

```
jhleasing/
├── public/                   # Assets estáticos (placeholder, favicon)
├── src/
│   ├── assets/               # Imágenes, logos, video hero
│   │   ├── brands/           # 26 SVGs de logos de marca
│   │   └── vehicles/         # Imágenes seed de vehículos
│   ├── components/
│   │   ├── ui/               # shadcn components (no modificar manualmente)
│   │   ├── admin/            # Componentes del panel /admin
│   │   ├── auth/             # Helpers de auth (RecoveryRedirect)
│   │   └── *.tsx             # Componentes compartidos (HeroSection, VehicleCard, etc.)
│   ├── data/
│   │   ├── brands.ts         # 26 marcas + logos hardcoded
│   │   └── vehicleOptions.ts # Tipos, colores, estados
│   ├── hooks/                # Custom hooks (useAuth, useVehicles, etc.)
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts     # Cliente Supabase (auto-generado)
│   │       └── types.ts      # Tipos de BDD (auto-generado)
│   ├── lib/                  # Utilidades (format, vehicleExcel, etc.)
│   ├── pages/                # Rutas de la app
│   ├── test/                 # Setup + ejemplos de tests
│   ├── types/                # Types compartidos (VehicleRow, etc.)
│   ├── App.tsx               # Router principal
│   ├── main.tsx              # Entry point + bootstrap
│   └── index.css             # Estilos globales + tokens neumórficos
├── supabase/
│   ├── functions/            # Edge functions (Deno)
│   │   ├── manage-users/
│   │   ├── upload-vehicle-image/
│   │   ├── on-signup/
│   │   └── cleanup-unconfirmed/
│   └── migrations/           # Migraciones SQL (orden alfabético por fecha)
├── docs/                     # Esta documentación
├── index.html                # HTML base con meta tags
├── package.json              # Dependencias
├── vite.config.ts            # Config de Vite
├── tailwind.config.ts        # Config de Tailwind
├── tsconfig.json             # Config de TypeScript
└── eslint.config.js          # Config de ESLint
```

---

## 4. Base de datos

### Tablas principales

| Tabla | Descripción |
|---|---|
| `vehicles` | Todo el inventario |
| `user_roles` | `(user_id, role)` — roles: admin / employee |
| `allowed_domains` | Dominios autorizados para registro |
| `brand_logos` | Logos de marcas personalizadas (fuera del catálogo) |

### Vistas

| Vista | Uso |
|---|---|
| `vehicles_public` | Catálogo público (sin campos sensibles como VIN, sold_price) |
| `vehicles_employee` | Catálogo para empleados (incluye `price_employee`) |

### Buckets de Storage

| Bucket | Acceso |
|---|---|
| `vehicle-images` | Public read, admin write |
| `brand-logos` | Public read, admin write |

### Funciones SQL

| Función | Uso |
|---|---|
| `has_role(uuid, app_role)` | Verifica si un usuario tiene un rol. SECURITY DEFINER. |
| `get_vehicle_vin(_slug text)` | Retorna el VIN de un vehículo por slug. Usada por `/solicitar-compra`. |

---

## 5. Edge Functions

Todas corren en Deno sobre el runtime de Supabase.

### `manage-users`

Endpoint único para gestión de usuarios (crear, editar rol, resetear contraseña, eliminar).

- Acepta JWT en header `Authorization`.
- Verifica que el caller sea **admin** antes de cualquier acción.
- Usa `SUPABASE_SERVICE_ROLE_KEY` solo del lado servidor.
- Actions: `list`, `create`, `update_role`, `delete`, `reset_password`.

### `upload-vehicle-image`

Upload seguro de imágenes a `vehicle-images` bucket.

- Requiere JWT válido.
- Verifica rol `admin` o `employee`.
- Valida MIME type (JPG/PNG/WebP) y tamaño (máx 100MB configurable).
- Usa service role solo después de verificar al caller.

### `on-signup`

Webhook llamado por Supabase Auth después de un signup.

- Verifica firma del webhook con `WEBHOOK_SECRET`.
- Extrae dominio del correo.
- Busca en `allowed_domains`.
- Si no existe: elimina el usuario (cleanup inmediato).
- Si existe: inserta en `user_roles` con rol `employee`.

### `cleanup-unconfirmed`

Cron job que borra usuarios con correo sin confirmar después de cierto tiempo.

- Protegido por `CRON_SECRET`.
- No es user-callable.

---

## 6. Rutas y páginas

| Ruta | Componente | Protegida |
|---|---|---|
| `/` | `Index` | No |
| `/inventario` | `Inventory` | No |
| `/vehiculo/:id` | `VehicleDetail` | No |
| `/comparar` | `Compare` | No |
| `/solicitar-compra/:slug` | `PurchaseRequest` | No |
| `/login` | `Login` | No |
| `/registro` | `Register` | No |
| `/reset-password` | `ResetPassword` | No (token) |
| `/admin` | `Admin` (envuelto en `AdminGuard`) | **Sí** (admin only) |
| `*` | `NotFound` | — |

---

## 7. Convenciones de código

### TypeScript

- **Strict mode OFF** actualmente (`strict: false`) — deuda técnica aceptada para permitir integración fluida con Lovable.
- Se usa `unknown` en bloques `catch` con narrowing (`err instanceof Error`).
- Se evita `any` excepto donde Supabase types no están generados (brand_logos).

### Tailwind

- **Tokens de diseño** en `tailwind.config.ts` + `index.css`.
- Clases neumórficas personalizadas:
  - `neu-card` — tarjeta principal con sombra elevada
  - `neu-tag` — píldora con sombra sutil
  - `neu-inset-sm` — inset shadow pequeña
  - `neu-accent` — tarjeta con acento de color
- Paleta semántica:
  - `brand-spellbound` — marrón oscuro (secundario)
  - `brand-euphorbia` — beige (fondo)
  - `primary` — naranja coral (acento)

### Naming

- Componentes: `PascalCase.tsx`
- Hooks: `useXxx.ts(x)`
- Utilities: `camelCase.ts`
- Rutas: kebab-case (`/solicitar-compra`)

---

## 8. Flujo de deploy

1. Commits a `main` o PRs mergeados.
2. Lovable detecta el cambio (webhook de GitHub).
3. Lovable hace `bun install` + `vite build`.
4. Despliega el bundle a su CDN.
5. Se actualiza `jhleasing.scaletechconsulting.mx` en 1-2 minutos.

### Para edge functions

- Lovable sincroniza los archivos de `supabase/functions/`.
- Los despliega automáticamente a Supabase.

### Para migraciones SQL

- **NO se aplican automáticamente.**
- Deben ejecutarse manualmente en Supabase Dashboard → SQL Editor.
- Los archivos en `supabase/migrations/` son solo historial documental.

---

## 9. Variables de entorno

| Variable | Dónde se define | Uso |
|---|---|---|
| `VITE_SUPABASE_URL` | Hardcoded en `client.ts` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Hardcoded en `client.ts` | Anon key (pública por diseño) |
| `SUPABASE_URL` | Edge functions env | Igual que el frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge functions env (secreto) | Para operaciones admin en edge functions |
| `SUPABASE_ANON_KEY` | Edge functions env | Para verificar JWTs de usuarios |
| `WEBHOOK_SECRET` | Edge functions env (secreto) | Verificación de webhook on-signup |
| `CRON_SECRET` | Edge functions env (secreto) | Protección de cleanup-unconfirmed |

> **Nota:** las credenciales Supabase en `client.ts` están hardcoded intencionalmente para compatibilidad con Lovable. La `anon key` está diseñada para ser pública (Supabase la protege con RLS).

---

## 10. Scripts de npm / bun

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build en modo development |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint sobre todo el código |
| `npm run test` | Ejecuta tests con Vitest |
| `npm run test:watch` | Tests en modo watch |
