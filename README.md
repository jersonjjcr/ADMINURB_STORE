# 🏪 Urban Store - Sistema de Administración

Sistema completo de administración para Urban Store con gestión de inventario, ventas, créditos y notificaciones automáticas por WhatsApp.

## 📋 Características

- ✅ **Gestión de Inventario**: CRUD completo de productos con control de stock
- 💰 **Registro de Ventas**: Ventas en efectivo, tarjeta o crédito
- 💳 **Control de Créditos**: Administración de clientes y deudas
- 🔔 **Notificaciones Automáticas**: Recordatorios por WhatsApp cada 7 días
- 📊 **Dashboard**: Métricas en tiempo real
- 🎨 **UI Moderna**: Interfaz responsive con TailwindCSS

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- MongoDB con Mongoose
- node-cron (tareas programadas)
- Twilio (WhatsApp API)

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router v6
- Context API
- Axios

## 📦 Instalación

### Prerrequisitos

1. **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
2. **MongoDB** - Opciones:
   - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local)
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud - gratis)
3. **Cuenta de Twilio** (para notificaciones) - [Registro](https://www.twilio.com/try-twilio)

### Paso 1: Clonar o descargar el proyecto

El proyecto ya está en `d:\URB\`

### Paso 2: Instalar dependencias del Backend

```powershell
cd d:\URB\backend
npm install
```

### Paso 3: Configurar variables de entorno del Backend

Copia el archivo de ejemplo y configúralo:

```powershell
Copy-Item .env.example .env
```

Edita `d:\URB\backend\.env` con tus credenciales:

```env
# MongoDB - Opción 1: Local
MONGO_URI=mongodb://localhost:27017/urban_store

# MongoDB - Opción 2: Atlas (reemplaza con tu conexión string)
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/urban_store

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Twilio (obtén en https://console.twilio.com)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# JWT (genera una clave aleatoria segura)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
```

### Paso 4: Instalar dependencias del Frontend

```powershell
cd d:\URB\frontend
npm install
```

### Paso 5: Configurar variables de entorno del Frontend

```powershell
Copy-Item .env.example .env
```

El archivo `.env` ya tiene la configuración por defecto:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Ejecución

### Opción 1: Ejecutar Backend y Frontend por separado

**Terminal 1 - Backend:**

```powershell
cd d:\URB\backend
npm run dev
```

**Terminal 2 - Frontend:**

```powershell
cd d:\URB\frontend
npm run dev
```

### Opción 2: Script único (PowerShell)

Crea un archivo `start.ps1` en `d:\URB\`:

```powershell
# Iniciar backend en background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\URB\backend; npm run dev"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar frontend en background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\URB\frontend; npm run dev"

Write-Host "✅ Urban Store iniciado" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
```

Ejecutar:

```powershell
cd d:\URB
.\start.ps1
```

## 📊 Cargar datos de ejemplo

Para poblar la base de datos con productos y clientes de ejemplo:

```powershell
cd d:\URB\backend
npm run seed
```

Esto creará:
- 10 productos de ejemplo
- 5 clientes
- 4 ventas (2 a crédito)
- Stock ya descontado

## 🔧 Configuración de Twilio (WhatsApp)

### Paso 1: Crear cuenta

1. Regístrate en [Twilio](https://www.twilio.com/try-twilio)
2. Verifica tu número de teléfono

### Paso 2: Obtener credenciales

1. Ve a [Console](https://console.twilio.com/)
2. Copia:
   - **Account SID**
   - **Auth Token**

### Paso 3: Configurar WhatsApp Sandbox (Desarrollo)

1. Ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Sigue las instrucciones para unir tu WhatsApp personal al sandbox
3. Usa el número del sandbox: `whatsapp:+14155238886` (ejemplo)

### Paso 4: Actualizar `.env`

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Paso 5: Producción (Opcional)

Para usar en producción con tu propio número:
1. Ve a [WhatsApp senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
2. Solicita aprobación para tu número
3. Actualiza `TWILIO_WHATSAPP_FROM` con tu número aprobado

## ⏰ Cron Job de Notificaciones

El cron job está configurado para ejecutarse **todos los lunes a las 9:00 AM**.

Para cambiar la frecuencia, edita `backend/cron/notificationCron.js`:

```javascript
// Expresiones cron comunes:
// '0 9 * * 1'      - Lunes a las 9:00 AM
// '0 9 * * *'      - Todos los días a las 9:00 AM
// '0 */6 * * *'    - Cada 6 horas
// '*/30 * * * *'   - Cada 30 minutos
// '* * * * *'      - Cada minuto (solo para pruebas)

cron.schedule('0 9 * * 1', async () => {
  await sendDebtReminders();
});
```

### Probar manualmente

Puedes crear un endpoint temporal o usar Node REPL:

```powershell
cd d:\URB\backend
node
```

```javascript
import('./cron/notificationCron.js').then(m => m.runManualReminder());
```

## 📱 API Endpoints

### Productos
- `GET    /api/products` - Listar productos
- `GET    /api/products/:id` - Ver producto
- `POST   /api/products` - Crear producto
- `PUT    /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Ventas
- `GET  /api/sales` - Listar ventas
- `POST /api/sales` - Registrar venta
- `GET  /api/sales/today` - Ventas del día
- `GET  /api/sales/stats` - Estadísticas

### Clientes
- `GET  /api/customers` - Listar clientes
- `GET  /api/customers/:id` - Ver cliente
- `POST /api/customers` - Crear cliente
- `POST /api/customers/:id/payments` - Registrar pago
- `GET  /api/customers/delinquent` - Clientes morosos

### Dashboard
- `GET /api/dashboard` - Métricas generales

### Notificaciones
- `GET /api/notifications` - Logs de notificaciones
- `GET /api/notifications/stats` - Estadísticas

## 🎨 Estructura del Proyecto

```
d:\URB\
├── backend\
│   ├── controllers\      # Lógica de negocio
│   ├── routes\           # Rutas de la API
│   ├── models\           # Modelos de MongoDB
│   ├── services\         # Servicios (Twilio)
│   ├── cron\             # Jobs programados
│   ├── server.js         # Servidor Express
│   ├── seed.js           # Datos de ejemplo
│   └── package.json
│
└── frontend\
    ├── src\
    │   ├── components\   # Componentes reutilizables
    │   ├── pages\        # Páginas principales
    │   ├── context\      # Context API
    │   ├── hooks\        # Custom hooks
    │   ├── services\     # API cliente (axios)
    │   ├── App.jsx       # App principal
    │   └── main.jsx      # Entry point
    └── package.json
```

## 🐛 Solución de Problemas

### MongoDB no conecta

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solución:**
1. Verifica que MongoDB esté corriendo:
   ```powershell
   # Si instalaste MongoDB localmente
   net start MongoDB
   ```
2. O usa MongoDB Atlas (cloud)

### Puerto en uso

**Error:** `EADDRINUSE: address already in use :::5000`

**Solución:**
```powershell
# Matar proceso en puerto 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Twilio no envía mensajes

**Solución:**
1. Verifica credenciales en `.env`
2. En sandbox, asegúrate de haber unido tu número
3. El número debe incluir código de país: `+52555...`
4. Revisa logs en [Twilio Console](https://console.twilio.com/monitor/logs)

### Frontend no carga datos

**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador (F12)
3. Verifica CORS en `backend/server.js`

## 🔐 Seguridad (Producción)

Antes de desplegar a producción:

1. **Cambiar JWT_SECRET** a una clave aleatoria fuerte
2. **Usar HTTPS** para el backend
3. **Configurar CORS** correctamente
4. **Variables de entorno** seguras (no subir `.env` a git)
5. **Rate limiting** en endpoints críticos
6. **Validación** robusta en backend
7. **MongoDB** con autenticación habilitada

## 📈 Mejoras Futuras

- [ ] Autenticación con JWT/Passport
- [ ] Roles de usuario (admin, vendedor)
- [ ] Reportes en PDF/Excel
- [ ] Gráficas de ventas
- [ ] Backup automático de DB
- [ ] PWA (funciona offline)
- [ ] Múltiples sucursales
- [ ] Integración con facturación (SAT)
- [ ] App móvil (React Native)

## 📞 Soporte

Para dudas o problemas:
- Revisa la [documentación de Twilio](https://www.twilio.com/docs/whatsapp)
- Consulta [MongoDB docs](https://www.mongodb.com/docs/)
- Revisa logs en consola del servidor

## 📄 Licencia

MIT License - Urban Store © 2025

---

**¡Listo para vender! 🚀**

Para iniciar rápidamente:

```powershell
# Terminal 1
cd d:\URB\backend; npm run dev

# Terminal 2
cd d:\URB\frontend; npm run dev
```

Luego abre: **http://localhost:5173**
