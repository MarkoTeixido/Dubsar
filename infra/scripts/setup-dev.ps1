# ============================================
# Script de setup para desarrollo local (Windows PowerShell)
# ============================================

Write-Host "🚀 Dubsar - Setup de Desarrollo" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la raíz del proyecto
if (-not (Test-Path "backend") -and -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado" -ForegroundColor Red
    Write-Host "Instala Docker Desktop desde: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Verificar que Docker Compose está disponible
try {
    docker compose version | Out-Null
    Write-Host "✅ Docker Compose disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está disponible" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar archivo .env del backend
if (-not (Test-Path "backend/.env")) {
    Write-Host "⚠️  No existe backend/.env" -ForegroundColor Yellow
    
    if (Test-Path "backend/.env.example") {
        Copy-Item "backend/.env.example" "backend/.env"
        Write-Host "✅ Creado backend/.env - EDITA LAS VARIABLES" -ForegroundColor Green
    } else {
        Write-Host "📝 Creando backend/.env con tus variables..." -ForegroundColor Yellow
        @"
PORT=8000
GOOGLE_API_KEY=AIzaSyANLqbjPbLNcxJkR0GD4aItjtz2zLZn91Q
SUPABASE_URL=https://lhnsfwdbgysybprsdsqq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobnNmd2RiZ3lzeWJwcnNkc3FxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2MDYxMywiZXhwIjoyMDc2MDM2NjEzfQ.0k5_0xzW24YIiexZTdQapisyfaXlRrxaZTlrAvT3Ep0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobnNmd2RiZ3lzeWJwcnNkc3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjA2MTMsImV4cCI6MjA3NjAzNjYxM30.X6NPaMilItA42hNGBllO30FpPJ4S0cOerM5jx4JoRNM
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath "backend/.env" -Encoding utf8
        Write-Host "✅ Creado backend/.env" -ForegroundColor Green
    }
}

# Verificar archivo .env.local del frontend
if (-not (Test-Path "frontend/.env.local")) {
    Write-Host "⚠️  No existe frontend/.env.local" -ForegroundColor Yellow
    Write-Host "📝 Creando con valores por defecto..." -ForegroundColor Yellow
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -FilePath "frontend/.env.local" -Encoding utf8
    Write-Host "✅ Creado frontend/.env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Construyendo imágenes Docker..." -ForegroundColor Yellow
docker compose -f infra/docker/docker-compose.dev.yml build

Write-Host ""
Write-Host "✅ ¡Setup completado!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el proyecto:" -ForegroundColor Cyan
Write-Host "  docker compose -f infra/docker/docker-compose.dev.yml up" -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8000"
Write-Host ""