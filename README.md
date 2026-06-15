# QNAS — Sistema de Gestión de Archivos Multimedia (DAM)

Aplicación web con autenticación JWT, roles y permisos. Login + dashboard +
administración de usuarios. Contraseñas cifradas con bcrypt.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + TailwindCSS + React Router
- **Backend:** Node.js + Express + TypeScript
- **Base de datos:** MongoDB 7 (Mongoose)
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **(Más adelante)** Redis, Meilisearch, Backblaze B2

## Requisitos

- Node.js 20+ (probado en Node 22/24)
- npm 10+
- MongoDB — vía Docker Desktop (recomendado) o MongoDB Atlas (nube)

## Puesta en marcha (local)

```bash
cd qnas

# 1. Configuración del backend (crea backend/.env)
cp .env.example backend/.env        # Windows: copy .env.example backend\.env

# 2. Levanta MongoDB con Docker (necesita Docker Desktop corriendo)
docker compose up -d mongo
#    Alternativa sin Docker: pon tu cadena de MongoDB Atlas en backend/.env

# 3. Instala dependencias del monorepo
npm install

# 4. Crea los roles y el usuario admin inicial
npm run seed -w backend

# 5. Arranca backend (4000) y frontend (3000)
npm run dev
```

Abre **http://localhost:3000** e inicia sesión con:

```
Email:      admin@qnas.local
Contraseña: Admin123!
```

## Roles y permisos

El seed crea dos roles:

- **admin** — todos los permisos (gestión de usuarios, roles, archivos, tareas).
- **user** — solo lectura de archivos y tareas.

Los permisos se definen en `backend/src/config/permissions.ts`. El token JWT solo
guarda el id del usuario; los permisos se leen frescos de la BD en cada petición,
así que cambiar el rol de un usuario tiene efecto inmediato.

## Endpoints principales

```
POST   /api/auth/login      → { token, user }
GET    /api/auth/me         → usuario autenticado (requiere token)
GET    /api/users           → listar usuarios        (permiso users:read)
POST   /api/users           → crear usuario          (permiso users:create)
PUT    /api/users/:id       → actualizar usuario     (permiso users:update)
DELETE /api/users/:id       → eliminar usuario       (permiso users:delete)
GET    /api/roles           → listar roles           (permiso roles:read)
GET    /api/health          → estado del server + BD
```

## Comandos útiles

```bash
npm run dev -w backend      # solo backend
npm run dev -w frontend     # solo frontend
npm run seed -w backend     # recrear roles + admin
npm run build               # compila ambos (chequeo de tipos)
```

## Estructura

```
qnas/
├── backend/
│   └── src/
│       ├── config/        db.ts, permissions.ts
│       ├── models/        User.ts, Role.ts
│       ├── middleware/    auth.ts (requireAuth, requirePermission)
│       ├── controllers/   auth, user, role
│       ├── routes/        auth, user, role
│       ├── utils/         jwt.ts, password.ts (bcrypt)
│       ├── seed.ts        roles + usuario admin
│       └── index.ts
├── frontend/
│   └── src/
│       ├── lib/           api.ts, auth.tsx (AuthContext)
│       ├── components/    ProtectedRoute.tsx, Layout.tsx
│       ├── pages/         Login.tsx, Dashboard.tsx, Users.tsx
│       └── App.tsx
├── docker-compose.yml     MongoDB, Redis, Meilisearch
└── .env.example
```

## Próximos pasos

1. Modelo `files` + upload a Backblaze B2 con URLs firmadas.
2. Explorador de archivos + metadatos + taxonomías.
3. Sistema de tareas vinculadas a archivos.
4. Cambio de contraseña y perfil del usuario.

> Producción: Hetzner CPX31 + Coolify (deploy automático desde GitHub).
> A Vercel solo va el frontend de demo (estático).
