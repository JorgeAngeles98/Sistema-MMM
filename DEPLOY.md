# Desplegar MMM gratis (Vercel + Render + Atlas + R2)

Arquitectura del despliegue:

- **Frontend** (React/Vite) → **Vercel** (gratis)
- **Backend** (Express) → **Render** (gratis)
- **Base de datos** → **MongoDB Atlas** (gratis, M0)
- **Archivos** → **Cloudflare R2** (gratis, 10 GB)

El código ya está preparado: en tu PC sigue funcionando con Mongo local y disco; en la nube usa Atlas y R2 automáticamente cuando defines las variables de entorno.

> Nota: el plan gratis de Render **duerme** el backend tras ~15 min sin uso; la **primera** petición después tarda ~30–60 s en despertar. Normal para una demo.

---

## 1) MongoDB Atlas (base de datos)

1. Crea cuenta en https://www.mongodb.com/atlas y un **cluster M0 (Free)**.
2. **Database Access** → crea un usuario y contraseña (anótalos).
3. **Network Access** → Add IP → `0.0.0.0/0` (permitir desde cualquier lado).
4. **Connect → Drivers** → copia la cadena, algo como:
   `mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/qnas`
   (agrega `/qnas` antes del `?` para nombrar la base).

Guarda esa cadena: es tu **MONGO_URI**.

## 2) Cloudflare R2 (almacenamiento de archivos)

1. Crea cuenta en Cloudflare → **R2** → crea un bucket (ej. `mmm-archivos`).
2. En el bucket → **Settings → Public access** → habilita **r2.dev** (te da una URL pública `https://pub-xxxx.r2.dev`). Esa es tu **S3_PUBLIC_URL**.
3. **R2 → Manage API Tokens → Create API Token** (permiso Read & Write). Te da:
   - Access Key ID → **S3_ACCESS_KEY_ID**
   - Secret Access Key → **S3_SECRET_ACCESS_KEY**
4. El **endpoint S3** es `https://<ACCOUNT_ID>.r2cloudflarestorage.com`
   (lo ves en R2 → Overview). Esa es tu **S3_ENDPOINT**.
5. **S3_BUCKET** = el nombre del bucket. **S3_REGION** = `auto`.

## 3) Subir el código a GitHub

1. En la carpeta `qnas`, inicializa git y sube a un repo nuevo en GitHub:
   ```
   git init
   git add .
   git commit -m "MMM"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/mmm.git
   git push -u origin main
   ```
   (El `.gitignore` ya excluye `node_modules`, `uploads`, `dist` y `.env`.)

## 4) Desplegar el backend en Render

1. https://render.com → **New + → Blueprint** → conecta tu repo.
   Render detecta el archivo `render.yaml` y crea el servicio `mmm-backend`.
2. Completa las variables de entorno (Environment):
   - `MONGO_URI` = tu cadena de Atlas
   - `JWT_SECRET` = una cadena larga y aleatoria propia
   - `FRONTEND_URL` = (lo pones en el paso 6, déjalo provisional)
   - `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`
3. Deploy. Cuando termine, copia la URL del backend (ej. `https://mmm-backend.onrender.com`).

> Alternativa manual (sin blueprint): New + → Web Service → Root Directory `backend`,
> Build `npm install && npm run build`, Start `node dist/index.js`, y agrega las mismas variables.

## 5) Sembrar el admin y los datos base (una sola vez)

En tu PC, apuntando a Atlas:

1. Edita `backend/.env` y pon temporalmente `MONGO_URI=<tu cadena de Atlas>`.
2. Ejecuta: `npm run seed -w backend`
   (crea el rol admin/user, el usuario `admin@qnas.local` / `Admin123!` y las categorías).
3. Vuelve a dejar tu `MONGO_URI` local si seguirás desarrollando.

## 6) Desplegar el frontend en Vercel

1. https://vercel.com → **Add New → Project** → importa el repo.
2. **Root Directory**: selecciona la carpeta `frontend`.
   (Framework: Vite — lo detecta solo. Build: `npm run build`, Output: `dist`.)
3. En **Environment Variables** agrega:
   - `VITE_API_URL` = la URL del backend de Render (paso 4),
     ej. `https://mmm-backend.onrender.com`
4. Deploy. Copia la URL del frontend (ej. `https://mmm.vercel.app`).

## 7) Conectar los dos (CORS)

1. Vuelve a **Render → tu servicio → Environment** y pon
   `FRONTEND_URL` = la URL de Vercel (ej. `https://mmm.vercel.app`).
2. Guarda → Render redepliega. Listo.

---

## Probar

Abre la URL de Vercel, inicia sesión con `admin@qnas.local` / `Admin123!`,
crea una carpeta, sube una foto (se guarda en R2) y verifica el dashboard.

## Recomendaciones antes de presentar

- Cambia la **contraseña del admin** desde su perfil.
- Usa un **JWT_SECRET** propio y largo.
- La primera carga tras inactividad será lenta (Render free). Si quieres,
  abre la app un par de minutos antes de la presentación para "despertarla".
