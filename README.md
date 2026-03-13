<p align="center">
  <img src="public/images/logo-carapari.png" alt="Caraparí Turismo" width="120" />
</p>

<h1 align="center">RV-Caraparí — Plataforma de Turismo Virtual</h1>

<p align="center">
  Aplicación web de turismo virtual inmersivo para la localidad de <strong>Caraparí</strong> (Gran Chaco, Bolivia).<br/>
  Recorridos 360°, modelos 3D interactivos, sistema de reseñas y calificaciones, panel de administración completo.
</p>

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Servidor de Desarrollo](#servidor-de-desarrollo)
- [Compilación para Producción](#compilación-para-producción)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [Modelos y Relaciones](#modelos-y-relaciones)
- [Rutas y API](#rutas-y-api)
- [Páginas del Frontend](#páginas-del-frontend)
- [Componentes Principales](#componentes-principales)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Panel de Administración](#panel-de-administración)
- [Tema y Colores](#tema-y-colores)
- [Seeders (Datos de Prueba)](#seeders-datos-de-prueba)
- [Scripts Disponibles](#scripts-disponibles)
- [Licencia](#licencia)

---

## Descripción General

**RV-Caraparí** es una plataforma web que permite a los usuarios explorar lugares turísticos de Caraparí mediante:

- **Recorridos 360°** — Visor panorámico interactivo con A-Frame, hotspots de modelos 3D y flechas de navegación entre imágenes.
- **Modelos 3D** — Visualización de activos `.glb` con `model-viewer` y Three.js, compatibles con WebXR/VR.
- **Reseñas y Calificaciones** — Sistema completo de valoración (1-5 estrellas), reseñas con votación de utilidad.
- **Panel de Administración** — Gestión de lugares, imágenes, hotspots, rutas de navegación, modelos 3D, usuarios y reseñas.
- **Autenticación segura** — Registro, login, verificación de email, 2FA, recuperación de contraseña.

---

## Tecnologías

### Backend

| Tecnología          | Versión   | Uso                                      |
| ------------------- | --------- | ---------------------------------------- |
| PHP                 | 8.2+      | Lenguaje del servidor                    |
| Laravel             | 12.x      | Framework PHP                            |
| Inertia.js          | 2.x       | Puente server-side ↔ SPA React          |
| Laravel Fortify     | 1.30+     | Autenticación, 2FA, verificación email   |
| SQLite / MySQL      | —         | Base de datos (SQLite por defecto)       |

### Frontend

| Tecnología          | Versión   | Uso                                      |
| ------------------- | --------- | ---------------------------------------- |
| React               | 19.x      | Framework UI                             |
| TypeScript          | 5.7+      | Tipado estático                          |
| Tailwind CSS        | 4.x       | Estilos utilitarios                      |
| Vite                | 7.x       | Bundler y servidor de desarrollo         |
| A-Frame             | 1.4.1     | Visor 360° con WebGL (CDN)              |
| Three.js            | 0.181     | Renderizado 3D / WebXR                   |
| @react-three/fiber  | 9.x       | React bindings para Three.js             |
| @react-three/xr     | 6.x       | Soporte WebXR / VR                       |
| Leaflet             | 1.9       | Mapas interactivos                       |
| Radix UI            | —         | Componentes accesibles (shadcn/ui)       |
| Lucide React        | —         | Iconos SVG                               |

### Herramientas de Desarrollo

| Herramienta         | Uso                                      |
| ------------------- | ---------------------------------------- |
| Pest                | Testing PHP                              |
| ESLint              | Linting JavaScript/TypeScript            |
| Prettier            | Formateo de código                       |
| Laravel Pint        | Formateo de código PHP                   |
| Laravel Pail        | Visor de logs en tiempo real             |

---

## Requisitos Previos

- **PHP** ≥ 8.2 con extensiones: `mbstring`, `xml`, `sqlite3` (o el driver de BD elegido), `fileinfo`
- **Composer** ≥ 2.x
- **Node.js** ≥ 20.x
- **npm** ≥ 10.x

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd Rv-carapari

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Instalación automática (instala dependencias, genera key, migra, compila)
composer run setup

# --- O instalación manual: ---

# 3a. Instalar dependencias PHP
composer install

# 3b. Generar clave de aplicación
php artisan key:generate

# 3c. Crear base de datos SQLite
# (asegúrate de que exista el archivo database/database.sqlite)

# 3d. Ejecutar migraciones
php artisan migrate

# 3e. (Opcional) Cargar datos de prueba
php artisan db:seed

# 3f. Instalar dependencias JavaScript
npm install

# 3g. Compilar assets
npm run build

# 3h. Crear enlace simbólico de storage
php artisan storage:link
```

---

## Servidor de Desarrollo

```bash
# Opción 1: Todo en un comando (Laravel + Queue + Logs + Vite)
composer run dev

# Opción 2: Por separado
php artisan serve          # Terminal 1: Servidor PHP (http://localhost:8000)
npm run dev                # Terminal 2: Vite HMR
php artisan queue:listen   # Terminal 3: Cola de trabajos
php artisan pail           # Terminal 4: Logs en tiempo real
```

---

## Compilación para Producción

```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Estructura del Proyecto

```
Rv-carapari/
├── app/
│   ├── Actions/Fortify/           # Acciones de autenticación (Fortify)
│   ├── Console/Commands/          # Comandos Artisan personalizados
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/             # Controladores del panel admin
│   │   │   │   ├── Asset3dController.php
│   │   │   │   ├── HotspotController.php
│   │   │   │   ├── PlaceController.php
│   │   │   │   ├── PlaceImageController.php
│   │   │   │   ├── PlaceImageRouteController.php
│   │   │   │   ├── ReviewController.php
│   │   │   │   └── UserController.php
│   │   │   ├── Api/               # Controladores API
│   │   │   │   └── ReviewVoteController.php
│   │   │   ├── PlaceController.php
│   │   │   ├── RatingController.php
│   │   │   └── ReviewController.php
│   │   ├── Middleware/
│   │   │   ├── AdminMiddleware.php       # Verifica rol admin
│   │   │   ├── HandleInertiaRequests.php # Props compartidas (auth, sidebar)
│   │   │   └── HandleAppearance.php      # Preferencia de tema
│   │   └── Requests/              # Form Requests de validación
│   ├── Models/
│   │   ├── Asset3d.php
│   │   ├── Place.php
│   │   ├── PlaceImage.php
│   │   ├── PlaceImageHotspot.php
│   │   ├── PlaceImageRoute.php
│   │   ├── Rating.php
│   │   ├── Review.php
│   │   ├── ReviewVote.php
│   │   ├── User.php
│   │   └── UserReview.php
│   └── Providers/
├── database/
│   ├── factories/                 # Fábricas para testing
│   ├── migrations/                # Migraciones de BD
│   └── seeders/                   # Datos de prueba
├── public/
│   ├── images/                    # Imágenes estáticas (hero, logo)
│   └── build/                     # Assets compilados (Vite)
├── resources/
│   ├── css/                       # Estilos globales
│   ├── js/
│   │   ├── components/            # Componentes React reutilizables
│   │   │   ├── ui/                # shadcn/ui (Radix)
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sphere360Picker.tsx
│   │   │   ├── Model3DViewer.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── vr-scene.tsx
│   │   │   └── ...
│   │   ├── constants/             # Constantes (tema, colores)
│   │   ├── layouts/               # Layouts (auth, app, admin)
│   │   ├── pages/                 # Páginas Inertia
│   │   │   ├── Admin/             # Páginas de administración
│   │   │   ├── Places/            # Páginas públicas de lugares
│   │   │   ├── auth/              # Login, Registro, 2FA
│   │   │   ├── settings/          # Configuración de usuario
│   │   │   ├── Landing.tsx        # Página de inicio
│   │   │   └── dashboard.tsx      # Dashboard admin
│   │   ├── routes/                # Definiciones de rutas (Wayfinder)
│   │   └── types/                 # Interfaces TypeScript
│   └── views/                     # Blade templates
├── routes/
│   ├── web.php                    # Rutas web principales
│   ├── settings.php               # Rutas de configuración de usuario
│   └── console.php                # Rutas de consola
├── storage/                       # Archivos subidos, logs, cache
├── tests/                         # Tests con Pest
├── composer.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Base de Datos

### Diagrama de Tablas

```
users
├── id, name, email, password, role (admin|user), avatar
├── two_factor_secret, two_factor_recovery_codes
└── timestamps

places
├── id, title, slug (unique), short_description, description
├── thumbnail, main_360_image
├── latitude, longitude, address
├── is_available, sort_order
└── timestamps

place_images
├── id, place_id (FK → places)
├── title, image_path, description
├── type (gallery | main_360 | thumbnail)
├── is_main, is_active, sort_order
└── timestamps

place_image_hotspots
├── id, place_image_id (FK → place_images)
├── asset_3d_id (FK → assets_3d)
├── pos_x, pos_y, pos_z (coordenadas 3D)
├── label, description
├── is_active, sort_order
└── timestamps

place_image_routes
├── id, source_image_id (FK → place_images)
├── target_image_id (FK → place_images)
├── pos_x, pos_y, pos_z (posición de la flecha)
├── label
└── timestamps

assets_3d
├── id, name, description, model_path (.glb)
├── is_active, sort_order
└── timestamps

ratings
├── id, place_id (FK → places), user_id (FK → users)
├── rating (1-5)
└── timestamps
(unique: place_id + user_id)

reviews
├── id, place_id (FK → places), user_id (FK → users)
├── title, content (10-1000 chars)
├── is_approved, approved_at, approved_by (FK → users)
└── timestamps

review_votes
├── id, user_id (FK → users), review_id (FK → reviews)
├── vote_type (helpful | unhelpful)
└── timestamps
(unique: user_id + review_id)
```

---

## Modelos y Relaciones

```
User
 ├── hasMany → Rating
 ├── hasMany → Review
 ├── hasMany → UserReview
 └── hasMany → Review (como aprobador)

Place
 ├── hasMany → PlaceImage
 ├── hasOne  → PlaceImage (main)
 ├── hasMany → Rating
 └── hasMany → Review

PlaceImage
 ├── belongsTo → Place
 ├── hasMany   → PlaceImageHotspot
 └── hasMany   → PlaceImageRoute (como origen)

PlaceImageHotspot
 ├── belongsTo → PlaceImage
 └── belongsTo → Asset3d

PlaceImageRoute
 ├── belongsTo → PlaceImage (sourceImage)
 └── belongsTo → PlaceImage (targetImage)

Asset3d
 └── hasMany → PlaceImageHotspot

Rating
 ├── belongsTo → Place
 └── belongsTo → User

Review
 ├── belongsTo → Place
 ├── belongsTo → User
 ├── belongsTo → User (aprobador)
 └── hasMany   → ReviewVote

ReviewVote
 ├── belongsTo → User
 └── belongsTo → Review
```

---

## Rutas y API

### Rutas Públicas

| Método | Ruta                            | Descripción                            |
| ------ | ------------------------------- | -------------------------------------- |
| GET    | `/`                             | Landing page con lista de lugares      |
| GET    | `/places`                       | Listado de todos los lugares           |
| GET    | `/places/{slug}`                | Detalle de un lugar                    |
| GET    | `/places/{slug}/360`            | Visor 360° del lugar                   |
| GET    | `/model-3d/{id}`                | Visor de modelo 3D                     |
| GET    | `/vr`                           | Escena de realidad virtual             |
| GET    | `/images/3d/{filename}`         | Servir archivos .glb (con cache)       |

### API (requiere autenticación)

| Método | Ruta                                      | Descripción                     |
| ------ | ----------------------------------------- | ------------------------------- |
| POST   | `/api/ratings`                            | Crear/actualizar calificación   |
| GET    | `/api/places/{place}/ratings`             | Estadísticas de calificaciones  |
| DELETE | `/api/places/{place}/rating`              | Eliminar calificación propia    |
| GET    | `/api/places/{place}/reviews`             | Obtener reseñas (paginadas)     |
| POST   | `/api/reviews`                            | Crear reseña                    |
| PUT    | `/api/reviews/{review}`                   | Editar reseña propia            |
| DELETE | `/api/reviews/{review}`                   | Eliminar reseña                 |
| GET    | `/api/review-votes/user-votes/{placeId}`  | Votos del usuario para un lugar |
| POST   | `/api/review-votes/{reviewId}`            | Votar reseña (útil/no útil)     |

### Autenticación (Laravel Fortify)

| Ruta                     | Descripción                     |
| ------------------------ | ------------------------------- |
| `/login`                 | Iniciar sesión                  |
| `/register`              | Registro de usuario             |
| `/forgot-password`       | Solicitar recuperación          |
| `/reset-password/{token}`| Restablecer contraseña          |
| `/verify-email`          | Verificar correo electrónico    |
| `/settings/profile`      | Configuración del perfil        |
| `/settings/password`     | Cambiar contraseña              |
| `/settings/appearance`   | Preferencias de apariencia      |

### Rutas de Administración

> **Prefijo:** `/admin/` — Requiere autenticación + rol admin.

| Recurso      | Rutas CRUD                                               | Extras                          |
| ------------ | -------------------------------------------------------- | ------------------------------- |
| **Lugares**  | `places` (index, create, store, edit, update, destroy)   | `toggle-availability`           |
| **Imágenes** | `places/{place}/images` (CRUD completo)                  | `toggle-active`, `set-main`     |
| **Hotspots** | `places/{place}/images/{image}/hotspots` (CRUD)          | `toggle-active`                 |
| **Rutas 360**| `places/{place}/images/{image}/routes` (store, destroy)  | —                               |
| **Assets 3D**| `assets3d` (CRUD completo)                               | `toggle-active`                 |
| **Usuarios** | `users` (CRUD completo + show)                           | `toggle-role`                   |
| **Reseñas**  | `reviews` (index, show, destroy)                         | `approve`, `disapprove`         |

---

## Páginas del Frontend

### Públicas

| Página                      | Descripción                                                  |
| --------------------------- | ------------------------------------------------------------ |
| **Landing**                 | Hero con video, tours VR, galería, mapa de lugares, FAQ      |
| **Places/Index**            | Listado de lugares con tarjetas y calificaciones             |
| **Places/[slug]**           | Detalle del lugar: galería, reseñas, calificaciones, mapa    |
| **Places/Viewer360**        | Visor 360° con hotspots 3D y flechas de navegación           |
| **Model3D**                 | Visor de modelos 3D (.glb) con Three.js                      |
| **VR**                      | Escena WebXR para realidad virtual                           |

### Autenticación

| Página                      | Descripción                      |
| --------------------------- | -------------------------------- |
| **auth/login**              | Formulario de inicio de sesión   |
| **auth/register**           | Formulario de registro           |
| **auth/forgot-password**    | Solicitar recuperación           |
| **auth/reset-password**     | Restablecer contraseña           |
| **auth/verify-email**       | Verificación de correo           |
| **auth/two-factor-challenge** | Desafío 2FA                    |

### Panel de Administración

| Página                      | Descripción                                          |
| --------------------------- | ---------------------------------------------------- |
| **dashboard**               | Estadísticas generales                               |
| **Admin/Places**            | CRUD de lugares (crear, editar, listar, eliminar)    |
| **Admin/Places/Images**     | Gestión de imágenes por lugar                        |
| **Admin/Hotspots**          | Gestión de hotspots 3D en imágenes 360°              |
| **Admin/Assets3d**          | Subida y gestión de modelos 3D (.glb)                |
| **Admin/Users**             | Gestión de usuarios y roles                          |
| **Admin/Reviews**           | Moderación de reseñas (aprobar/rechazar/eliminar)    |

### Configuración de Usuario

| Página                      | Descripción                      |
| --------------------------- | -------------------------------- |
| **settings/profile**        | Nombre, email, avatar            |
| **settings/password**       | Cambiar contraseña               |
| **settings/appearance**     | Tema claro/oscuro                |

---

## Componentes Principales

### Interactivos

| Componente           | Descripción                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `Sphere360Picker`    | Selector de coordenadas 3D sobre imagen 360° (admin)            |
| `Model3DViewer`      | Visor de modelos 3D con Three.js / model-viewer                  |
| `LocationPicker`     | Selector de ubicación geográfica con mapa Leaflet                |
| `vr-scene`           | Configuración de escena VR con @react-three/xr                   |
| `Navbar`             | Barra de navegación responsiva con estado de autenticación        |
| `ConfirmDeleteModal` | Modal de confirmación para acciones destructivas                 |

### UI (shadcn/ui — Radix)

El proyecto incluye una librería completa de componentes accesibles basados en Radix UI:

`Alert` · `Avatar` · `Button` · `Card` · `Checkbox` · `Dialog` · `DropdownMenu` · `Form` · `Input` · `InputOTP` · `Label` · `Select` · `Sheet` · `Sidebar` · `Skeleton` · `Spinner` · `Table` · `Tabs` · `Textarea` · `Toggle` · `Tooltip`

---

## Sistema de Autenticación

Implementado con **Laravel Fortify**:

- **Registro** de usuarios con validación de nombre, email y contraseña.
- **Login** con email/contraseña, opción "Recuérdame".
- **Autenticación de dos factores (2FA)** con códigos TOTP y códigos de recuperación.
- **Verificación de email** obligatoria.
- **Recuperación de contraseña** con token por email.
- **Roles**: `admin` y `user` (enum en tabla `users`).
- **Middleware `AdminMiddleware`**: protege todas las rutas `/admin/*`.

### Credenciales por defecto (seeder)

| Rol   | Email                | Contraseña |
| ----- | -------------------- | ---------- |
| Admin | `admin@example.com`  | `password` |
| User  | `user@example.com`   | `password` |

---

## Panel de Administración

El panel admin (`/admin/*`) permite gestionar todos los recursos:

### Lugares
- Crear, editar, eliminar lugares turísticos.
- Subir thumbnail e imagen 360° principal.
- Configurar coordenadas GPS, dirección, descripción.
- Activar/desactivar visibilidad pública.
- Ordenar por fecha (más recientes / más antiguos).

### Imágenes
- Subir múltiples imágenes por lugar (galería, 360°, thumbnail).
- Establecer imagen principal.
- Activar/desactivar imágenes individuales.

### Hotspots 3D
- Posicionar hotspots sobre imágenes 360° con el `Sphere360Picker`.
- Asociar modelos 3D a cada hotspot.
- Configurar etiqueta y descripción.

### Rutas de Navegación
- Crear flechas de navegación entre imágenes 360°.
- Seleccionar imagen destino y posición de la flecha.
- Las rutas se muestran como flechas azules animadas en el visor público.

### Modelos 3D
- Subir archivos `.glb` para su uso en hotspots.
- Previsualizar modelos con `model-viewer`.
- Activar/desactivar modelos.

### Usuarios
- CRUD completo de usuarios.
- Subir avatares.
- Cambiar roles (admin ↔ usuario).
- Búsqueda y filtrado por rol.

### Reseñas
- Listar todas las reseñas con filtros (estado, lugar, búsqueda).
- Aprobar / rechazar reseñas.
- Ver estadísticas por lugar.

---

## Tema y Colores

El proyecto usa un tema oscuro por defecto con Tailwind CSS. Los colores están centralizados en `resources/js/constants/theme.ts`:

| Variable            | Valor                | Uso                        |
| ------------------- | -------------------- | -------------------------- |
| `buttonPrimary`     | `bg-green-600`       | Botones principales        |
| `buttonPrimaryHover`| `hover:bg-green-500` | Hover en botones           |
| `bgDark`            | `bg-neutral-900`     | Fondo principal            |
| `bgCard`            | `bg-neutral-800`     | Fondo de tarjetas          |
| `textSecondary`     | `text-neutral-300`   | Texto secundario           |
| `textTertiary`      | `text-neutral-400`   | Texto terciario            |

---

## Seeders (Datos de Prueba)

```bash
# Ejecutar todos los seeders
php artisan db:seed

# Ejecutar seeder específico
php artisan db:seed --class=PlacesSeeder
php artisan db:seed --class=ReviewsSeeder
```

El `DatabaseSeeder` crea por defecto:
- 1 usuario admin (`admin@example.com`)
- 1 usuario regular (`user@example.com`)

---

## Scripts Disponibles

### PHP (Composer)

```bash
composer run dev        # Servidor de desarrollo completo
composer run test       # Ejecutar tests con Pest
composer run setup      # Instalación completa del proyecto
```

### JavaScript (npm)

```bash
npm run dev             # Servidor Vite con HMR
npm run build           # Compilar para producción
npm run build:ssr       # Compilar con SSR
npm run dev:ssr         # Desarrollo con SSR
npm run format          # Formatear código (Prettier)
npm run format:check    # Verificar formato
npm run lint            # Lint con auto-fix (ESLint)
npm run types           # Verificar tipos TypeScript
```

### Artisan (Laravel)

```bash
php artisan migrate             # Ejecutar migraciones
php artisan migrate:fresh       # Recrear BD desde cero
php artisan db:seed             # Cargar datos de prueba
php artisan storage:link        # Enlace simbólico de storage
php artisan queue:listen        # Escuchar cola de trabajos
php artisan pail                # Logs en tiempo real
php artisan config:cache        # Cachear configuración
php artisan route:cache         # Cachear rutas
```

---

## Licencia

Este proyecto está bajo la licencia [MIT](https://opensource.org/licenses/MIT).
