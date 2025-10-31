<p align="center">
  <a href="https://dubsarai.vercel.app/"><img src="https://i.imgur.com/npJju1C.png" height="128"></a>
  <h2 align="center"><a href="https://dubsarai.vercel.app/">Dubsar AI - Infraestructura</a></h2>
  <p align="center">Configuración Docker y scripts de automatización para desarrollo y producción<p>
  <p align="center">
    <a href="#-docker">
    	<img src="https://img.shields.io/badge/%F0%9F%90%B3-Docker-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="docker" />
    </a>
    <a href="#-scripts">
    	<img src="https://img.shields.io/badge/%F0%9F%93%9C-Scripts-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="scripts" />
    </a>
    <a href="#-inicio-rápido">
    	<img src="https://img.shields.io/badge/%E2%9A%A1-Quick%20Start-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="quick start" />
    </a>
    <a href="#-troubleshooting">
    	<img src="https://img.shields.io/badge/%F0%9F%94%A7-Troubleshooting-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="troubleshooting" />
    </a>
  </p>
</p>

<br>

![](https://i.imgur.com/waxVImv.png)

## 📁 Estructura

![](https://i.imgur.com/qmuxalZ.png)


![](https://i.imgur.com/waxVImv.png)

## 🐳 Docker

### Dockerfiles

#### Backend (`docker/backend.Dockerfile`)

Imagen optimizada para el backend de Node.js con Express.

**Características:**
- Base: `node:22-alpine` (imagen ligera)
- Multi-stage build para menor tamaño
- Health check incluido en `/health`
- Puerto: `8000`
- Optimizado para producción

**Build:**

```bash
# Desde la raíz del proyecto
docker build -f infra/docker/backend.Dockerfile -t dubsar-backend .

# Con BuildKit (más rápido)
DOCKER_BUILDKIT=1 docker build -f infra/docker/backend.Dockerfile -t dubsar-backend .
```

**Run:**

```bash
docker run -p 8000:8000 \
  -e GOOGLE_API_KEY=tu_key \
  -e SUPABASE_URL=tu_url \
  -e SUPABASE_SERVICE_ROLE_KEY=tu_key \
  -e SUPABASE_ANON_KEY=tu_key \
  dubsar-backend
```

#### Frontend (`docker/frontend.Dockerfile`)

Imagen optimizada para Next.js con Turbopack.

**Características:**
- Base: `node:22-alpine`
- Multi-stage build (builder + runner)
- Optimización automática de imágenes
- Puerto: `3000`
- Production-ready

**Build:**

```bash
# Desde la raíz del proyecto
docker build -f infra/docker/frontend.Dockerfile -t dubsar-frontend .

# Con build args
docker build -f infra/docker/frontend.Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -t dubsar-frontend .
```

**Run:**

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  dubsar-frontend
```

### Docker Compose (`docker/docker-compose.dev.yml`)

Orquestación completa de la aplicación para desarrollo local.

**Servicios incluidos:**
- `backend`: Backend API en Node.js
- `frontend`: Frontend Next.js

**Características:**
- Hot reload habilitado
- Volúmenes para desarrollo
- Variables de entorno desde `.env`
- Networking automático entre servicios

**Uso:**

```bash
# Iniciar todos los servicios
docker compose -f infra/docker/docker-compose.dev.yml up

# En modo detached (background)
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Ver logs
docker compose -f infra/docker/docker-compose.dev.yml logs -f

# Detener servicios
docker compose -f infra/docker/docker-compose.dev.yml down

# Detener y eliminar volúmenes
docker compose -f infra/docker/docker-compose.dev.yml down -v
```

**Servicios individuales:**

```bash
# Solo backend
docker compose -f infra/docker/docker-compose.dev.yml up backend

# Solo frontend
docker compose -f infra/docker/docker-compose.dev.yml up frontend
```

![](https://i.imgur.com/waxVImv.png)

## 📜 Scripts

### Setup Dev (Linux/macOS) - `scripts/setup-dev.sh`

Script Bash para configurar automáticamente el entorno de desarrollo.

**Funcionalidades:**
- ✅ Verifica prerequisitos (Node.js, npm, Docker)
- ✅ Instala dependencias de backend y frontend
- ✅ Crea archivos `.env` si no existen
- ✅ Configura Git hooks (opcional)
- ✅ Ejecuta health checks
- ✅ Muestra instrucciones de inicio

**Uso:**

```bash
# Dar permisos de ejecución
chmod +x infra/scripts/setup-dev.sh

# Ejecutar
./infra/scripts/setup-dev.sh

# O directamente
bash infra/scripts/setup-dev.sh
```

**Output esperado:**

```
🚀 Dubsar AI - Setup de Desarrollo

✅ Verificando prerequisitos...
   Node.js: v22.18.0
   npm: 10.2.3
   Docker: 24.0.6

📦 Instalando dependencias del backend...
✅ Dependencias del backend instaladas

📦 Instalando dependencias del frontend...
✅ Dependencias del frontend instaladas

🔧 Configurando archivos .env...
✅ Archivos .env configurados

✅ ¡Setup completado exitosamente!

📝 Próximos pasos:
   1. Configura tus credenciales en backend/.env
   2. Ejecuta: cd backend && npm run dev
   3. En otra terminal: cd frontend && npm run dev
```

### Setup Dev (Windows) - `scripts/setup-dev.ps1`

Script PowerShell equivalente para Windows.

**Funcionalidades:**
- ✅ Verifica prerequisitos (Node.js, npm, Docker)
- ✅ Instala dependencias automáticamente
- ✅ Crea archivos `.env` template
- ✅ Colores en consola para mejor UX
- ✅ Manejo de errores detallado

**Uso:**

```powershell
# Desde PowerShell (como Administrador si es necesario)
.\infra\scripts\setup-dev.ps1

# O permitir ejecución de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\infra\scripts\setup-dev.ps1
```

**Características especiales:**
- Detecta si Docker Desktop está corriendo
- Verifica versiones mínimas requeridas
- Crea directorios si no existen
- Output colorizado para mejor legibilidad

![](https://i.imgur.com/waxVImv.png)

## ⚡ Inicio Rápido

### Opción 1: Con Scripts de Setup

**Linux/macOS:**

```bash
# 1. Clonar repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar

# 2. Ejecutar setup
chmod +x infra/scripts/setup-dev.sh
./infra/scripts/setup-dev.sh

# 3. Configurar .env files
# Editar backend/.env y frontend/.env.local

# 4. Iniciar servicios
cd backend && npm run dev &
cd frontend && npm run dev
```

**Windows:**

```powershell
# 1. Clonar repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar

# 2. Ejecutar setup
.\infra\scripts\setup-dev.ps1

# 3. Configurar .env files
# Editar backend\.env y frontend\.env.local

# 4. Iniciar servicios
cd backend; npm run dev
# En otra terminal
cd frontend; npm run dev
```

### Opción 2: Con Docker Compose

```bash
# 1. Clonar repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar

# 2. Crear archivo .env en la raíz
cp backend/.env.example .env
# Editar .env con tus credenciales

# 3. Iniciar con Docker Compose
docker compose -f infra/docker/docker-compose.dev.yml up

# La app estará disponible en:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:3000
```

### Opción 3: Docker Manual

```bash
# 1. Build imágenes
docker build -f infra/docker/backend.Dockerfile -t dubsar-backend .
docker build -f infra/docker/frontend.Dockerfile -t dubsar-frontend .

# 2. Crear network
docker network create dubsar-network

# 3. Run backend
docker run -d \
  --name dubsar-backend \
  --network dubsar-network \
  -p 8000:8000 \
  --env-file backend/.env \
  dubsar-backend

# 4. Run frontend
docker run -d \
  --name dubsar-frontend \
  --network dubsar-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://dubsar-backend:8000 \
  dubsar-frontend
```

![](https://i.imgur.com/waxVImv.png)

## 🔧 Troubleshooting

### Script de setup falla

**Linux/macOS:**

```bash
# Verificar permisos
ls -l infra/scripts/setup-dev.sh

# Dar permisos si es necesario
chmod +x infra/scripts/setup-dev.sh

# Ejecutar con bash explícito
bash infra/scripts/setup-dev.sh
```

**Windows:**

```powershell
# Verificar política de ejecución
Get-ExecutionPolicy

# Cambiar si es necesario
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ejecutar
.\infra\scripts\setup-dev.ps1
```

### Docker build falla

```bash
# Limpiar cache de Docker
docker builder prune

# Build sin cache
docker build --no-cache -f infra/docker/backend.Dockerfile -t dubsar-backend .

# Verificar espacio en disco
docker system df
```

### Docker Compose no encuentra .env

```bash
# El archivo .env debe estar en la raíz del proyecto
# O especificar ruta
docker compose -f infra/docker/docker-compose.dev.yml --env-file ./backend/.env up
```

### Puerto ya en uso

```bash
# Verificar qué proceso usa el puerto
# Linux/macOS
lsof -i :8000
lsof -i :3000

# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Matar proceso
# Linux/macOS
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

### Hot reload no funciona en Docker

```bash
# Verificar que los volúmenes estén montados
docker compose -f infra/docker/docker-compose.dev.yml config

# Recrear contenedores
docker compose -f infra/docker/docker-compose.dev.yml up --force-recreate
```

![](https://i.imgur.com/waxVImv.png)

## 📊 Optimizaciones

### Tamaño de Imágenes

**Backend:**
```
Con alpine:     ~200 MB
Con node:latest: ~900 MB
Ahorro:         ~78%
```

**Frontend:**
```
Multi-stage:    ~150 MB
Single-stage:   ~1.2 GB
Ahorro:         ~87%
```

### Build Times

| Método | Primera vez | Con cache |
|--------|-------------|-----------|
| Backend Docker | ~2-3 min | ~30 seg |
| Frontend Docker | ~3-4 min | ~1 min |
| Docker Compose | ~5-7 min | ~1.5 min |
| Scripts setup | ~3-5 min | ~30 seg |

![](https://i.imgur.com/waxVImv.png)

## 🎯 Comandos Útiles

### Docker

```bash
# Ver imágenes construidas
docker images | grep dubsar

# Ver contenedores corriendo
docker ps

# Ver logs de un contenedor
docker logs dubsar-backend -f

# Acceder a bash dentro del contenedor
docker exec -it dubsar-backend sh

# Eliminar imágenes
docker rmi dubsar-backend dubsar-frontend

# Limpiar todo
docker system prune -a
```

### Docker Compose

```bash
# Estado de servicios
docker compose -f infra/docker/docker-compose.dev.yml ps

# Restart de un servicio
docker compose -f infra/docker/docker-compose.dev.yml restart backend

# Rebuild de un servicio
docker compose -f infra/docker/docker-compose.dev.yml build backend

# Ejecutar comando en servicio
docker compose -f infra/docker/docker-compose.dev.yml exec backend npm test
```

![](https://i.imgur.com/waxVImv.png)

## 🔐 Variables de Entorno

### .env en raíz

![](https://i.imgur.com/2SzT66c.png)


![](https://i.imgur.com/waxVImv.png)

---

<div align="center">

Hecho por [Marko Teixido](https://github.com/MarkoTeixido)

</div>