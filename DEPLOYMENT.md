# 🚀 Guía de Despliegue - Urban Store

## Arquitectura de Despliegue

- **Frontend**: Vercel (gratis)
- **Backend**: Render o Railway (gratis)
- **Database**: MongoDB Atlas (gratis)

---

## 📋 Prerrequisitos

1. Cuenta de GitHub (para conectar repos)
2. Cuenta de Vercel: https://vercel.com/signup
3. Cuenta de Render: https://render.com/ o Railway: https://railway.app/
4. Cuenta de MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register

---

## 1️⃣ MongoDB Atlas (Base de Datos)

### Paso 1: Crear Cluster
1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita
3. Click en "Build a Database"
4. Selecciona **FREE** (M0 Sandbox)
5. Elige región más cercana (ej: AWS - US East)
6. Click "Create Cluster"

### Paso 2: Configurar Acceso
1. En "Security" → "Database Access":
   - Click "Add New Database User"
   - Username: `urbanstore`
   - Password: Genera una fuerte (guárdala)
   - Database User Privileges: "Read and write to any database"

2. En "Security" → "Network Access":
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

### Paso 3: Obtener Connection String
1. Click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Copia el connection string:
   ```
   mongodb+srv://urbanstore:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con tu password real
5. Agrega el nombre de la DB al final:
   ```
   mongodb+srv://urbanstore:tupassword@cluster0.xxxxx.mongodb.net/urban_store?retryWrites=true&w=majority
   ```

**Guarda este string, lo usarás en el backend.**

---

## 2️⃣ Backend en Render

### Opción A: Deploy desde GitHub (Recomendado)

#### Paso 1: Subir a GitHub
```powershell
cd D:\URB
git init
git add .
git commit -m "Initial commit - Urban Store"

# Crea un repo en GitHub y luego:
git remote add origin https://github.com/TU_USUARIO/urban-store.git
git push -u origin main
```

#### Paso 2: Deploy en Render
1. Ve a https://render.com/ y crea cuenta
2. Click "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - **Name**: urban-store-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

5. Variables de entorno (Environment):
   ```
   MONGO_URI=mongodb+srv://urbanstore:tupassword@cluster0.xxxxx.mongodb.net/urban_store?retryWrites=true&w=majority
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://tu-frontend.vercel.app
   TWILIO_ACCOUNT_SID=tu_account_sid
   TWILIO_AUTH_TOKEN=tu_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   JWT_SECRET=tu_clave_secreta_muy_larga
   ```

6. Click "Create Web Service"

**URL del backend**: `https://urban-store-backend.onrender.com`

---

## 3️⃣ Frontend en Vercel

### Paso 1: Actualizar Variable de Entorno
Edita `frontend/.env`:
```env
VITE_API_URL=https://urban-store-backend.onrender.com/api
```

### Paso 2: Deploy

#### Opción A: CLI (rápido)
```powershell
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd D:\URB\frontend
vercel --prod
```

Sigue el wizard:
- Set up and deploy? **Yes**
- Which scope? Tu cuenta
- Link to existing project? **No**
- Project name? **urban-store**
- In which directory? **.**
- Override settings? **No**

#### Opción B: Dashboard (visual)
1. Ve a https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import tu repositorio de GitHub
4. Configuración:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   
5. Environment Variables:
   ```
   VITE_API_URL=https://urban-store-backend.onrender.com/api
   ```

6. Click "Deploy"

**URL del frontend**: `https://urban-store-xxx.vercel.app`

---

## 4️⃣ Actualizar CORS en Backend

Después del deploy, actualiza el backend para aceptar requests del frontend:

Edita las variables de entorno en Render:
```
FRONTEND_URL=https://urban-store-xxx.vercel.app
```

Render redesplegará automáticamente.

---

## 5️⃣ Cargar Datos Iniciales

Una vez desplegado, carga datos de ejemplo:

```powershell
# Actualiza backend/.env con la URL de MongoDB Atlas
cd D:\URB\backend
npm run seed
```

O crea un endpoint temporal en el backend para seed (no recomendado en producción).

---

## 🔧 Troubleshooting

### Frontend no conecta con Backend
- Verifica que `VITE_API_URL` apunte a tu backend de Render
- Verifica CORS en `backend/server.js`
- Checa logs en Render Dashboard

### Backend crashea
- Revisa logs en Render
- Verifica que `MONGO_URI` sea correcto
- Asegúrate que todas las variables de entorno estén configuradas

### MongoDB no conecta
- Verifica que la IP `0.0.0.0/0` esté whitelisted
- Verifica el connection string
- Asegúrate que el usuario tenga permisos

---

## 🎯 URLs Finales

Una vez completado:

- **Frontend**: `https://urban-store-xxx.vercel.app`
- **Backend**: `https://urban-store-backend.onrender.com`
- **API**: `https://urban-store-backend.onrender.com/api`

---

## 🔐 Seguridad en Producción

1. **No uses** el mismo `JWT_SECRET` que en desarrollo
2. **Configura** rate limiting en el backend
3. **Restringe** CORS solo a tu dominio de Vercel
4. **No expongas** credenciales en el frontend
5. **Habilita** HTTPS (automático en Vercel/Render)

---

## 📱 Notas Importantes

- **Render Free**: El servidor se "duerme" tras 15 min de inactividad (primer request tarda 30-60s)
- **MongoDB Free**: 512 MB de almacenamiento
- **Vercel Free**: 100 GB bandwidth/mes
- **Cron Jobs**: En plan gratuito de Render, los cron jobs no funcionan. Alternativas:
  - Usar un servicio externo (ej: cron-job.org)
  - Upgrade a plan pagado de Render

---

## 🚀 Comandos Rápidos

```powershell
# Deploy frontend a Vercel
cd frontend
vercel --prod

# Ver logs de Render
# (desde el dashboard web)

# Redeploy backend
git add .
git commit -m "Update"
git push
# Render redeployará automáticamente
```

---

¡Listo para producción! 🎉
