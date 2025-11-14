# 🏪 Urban Store - Inicio Rápido

## Opción 1: Ejecutar con script automático (recomendado)

```powershell
cd d:\URB
.\start.ps1
```

Esto instalará dependencias (si es necesario) e iniciará backend y frontend automáticamente.

## Opción 2: Manual

### Terminal 1 - Backend
```powershell
cd d:\URB\backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd d:\URB\frontend
npm install
npm run dev
```

## Primeros Pasos

1. **Instala MongoDB** si aún no lo tienes:
   - Local: https://www.mongodb.com/try/download/community
   - O usa MongoDB Atlas (gratis): https://www.mongodb.com/cloud/atlas

2. **Configura credenciales de Twilio** (opcional):
   - Edita `backend\.env`
   - Obtén credenciales en: https://console.twilio.com

3. **Carga datos de ejemplo**:
   ```powershell
   cd d:\URB\backend
   npm run seed
   ```

4. **Abre la aplicación**:
   - Frontend: http://localhost:5173
   - API: http://localhost:5000/api

## 📚 Documentación completa

Ver **README.md** principal para configuración detallada, API endpoints, y troubleshooting.

---

¡Listo para vender! 🚀
