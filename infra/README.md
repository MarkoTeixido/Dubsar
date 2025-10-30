# 🏗️ Infraestructura - Dubsar

Esta carpeta contiene toda la configuración de infraestructura del proyecto Dubsar.

## 📁 Estructura

```
infra/
├── docker/              # Configuración de Docker
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   ├── docker-compose.dev.yml
│   └── .dockerignore.*
├── scripts/             # Scripts de automatización
│   └── setup-dev.sh
└── README.md
```

## 🐳 Docker

### Requisitos Previos

- Docker instalado ([Descargar](https://docs.docker.com/get-docker/))
- Docker Compose (incluido en Docker Desktop)

### 🚀 Inicio Rápido

**Desde la raíz del proyecto:**

```bash
# 1. Dar permisos al script (solo la primera vez)
chmod +x infra/scripts/setup-dev.sh

# 2. Ejecutar setup
./infra/scripts/setup-dev.sh

# 3. Levantar contenedores
docker compose -f infra/docker/docker-compose.dev.yml up
```

**Acceder a:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

### 📝 Comandos Útiles

```bash
# Levantar en background (modo detached)
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Ver logs
docker compose -f infra/docker/docker-compose.dev.yml logs -f

# Ver logs solo del backend
docker compose -f infra/docker/docker-compose.dev.yml logs -f backend

# Detener contenedores
docker compose -f infra/docker/docker-compose.dev.yml down

# Detener y eliminar volúmenes (reset completo)
docker compose -f infra/docker/docker-compose.dev.yml down -v

# Reconstruir imágenes
docker compose -f infra/docker/docker-compose.dev.yml build

# Reconstruir sin caché
docker compose -f infra/docker/docker-compose.dev.yml build --no-cache

# Ejecutar bash dentro del contenedor backend
docker exec -it dubsar-backend-dev sh

# Ejecutar bash dentro del contenedor frontend
docker exec -it dubsar-frontend-dev sh
```

### 🔧 Variables de Entorno

Las variables de entorno se cargan desde:
- Backend: `backend/.env`
- Frontend: `frontend/.env.local`

Asegúrate de tener estos archivos configurados antes de levantar los contenedores.

### 🐛 Troubleshooting

**Problema: "Port already in use"**
```bash
# Ver qué proceso usa el puerto 8000
lsof -i :8000

# O el puerto 3000
lsof -i :3000

# Matar el proceso (reemplaza PID)
kill -9 <PID>
```

**Problema: Los cambios no se reflejan**
```bash
# Reconstruir las imágenes
docker compose -f infra/docker/docker-compose.dev.yml build --no-cache
docker compose -f infra/docker/docker-compose.dev.yml up
```

**Problema: Error de permisos en node_modules**
```bash
# Limpiar volúmenes
docker compose -f infra/docker/docker-compose.dev.yml down -v
docker compose -f infra/docker/docker-compose.dev.yml up
```
