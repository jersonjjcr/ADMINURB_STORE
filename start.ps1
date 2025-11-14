# Script de inicio para Urban Store
# Ejecuta: .\start.ps1

Write-Host "🏪 Iniciando Urban Store..." -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Descárgalo de https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si las dependencias están instaladas
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🚀 Iniciando servidores..." -ForegroundColor Green
Write-Host ""

# Iniciar backend en nueva ventana
$backendPath = Join-Path $PWD "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev"

# Esperar 3 segundos para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar frontend en nueva ventana
$frontendPath = Join-Path $PWD "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"

Write-Host "✅ Urban Store iniciado correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Backend API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "🎨 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Asegúrate de tener MongoDB corriendo" -ForegroundColor Yellow
Write-Host "ℹ️  Presiona Ctrl+C en cada ventana para detener los servidores" -ForegroundColor Gray
