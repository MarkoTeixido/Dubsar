#!/bin/bash

# ============================================
# Script de setup para desarrollo local
# ============================================

set -e  # Detener si hay error

echo "🚀 Dubsar - Setup de Desarrollo"
echo "================================"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar que Docker Compose está disponible
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está disponible${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker instalado correctamente${NC}"

# Verificar archivo .env del backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No existe backend/.env${NC}"
    echo "Creando desde ejemplo..."
    
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ Creado backend/.env - EDITA LAS VARIABLES${NC}"
    else
        echo -e "${RED}❌ No existe backend/.env.example${NC}"
    fi
fi

# Verificar archivo .env.local del frontend
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  No existe frontend/.env.local${NC}"
    echo "Creando con valores por defecto..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > frontend/.env.local
    echo -e "${GREEN}✅ Creado frontend/.env.local${NC}"
fi

echo ""
echo -e "${YELLOW}📦 Construyendo imágenes Docker...${NC}"
docker compose -f infra/docker/docker-compose.dev.yml build

echo ""
echo -e "${GREEN}✅ ¡Setup completado!${NC}"
echo ""
echo "Para iniciar el proyecto:"
echo -e "${YELLOW}  cd infra/docker${NC}"
echo -e "${YELLOW}  docker compose -f docker-compose.dev.yml up${NC}"
echo ""
echo "O desde la raíz:"
echo -e "${YELLOW}  docker compose -f infra/docker/docker-compose.dev.yml up${NC}"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo ""