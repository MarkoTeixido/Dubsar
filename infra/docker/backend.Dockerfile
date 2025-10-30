# ============================================
# ETAPA 1: Dependencias
# ============================================
FROM node:22.18.0-alpine AS deps

# Instalar dependencias necesarias para compilar módulos nativos
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./

# Instalar dependencias (solo production para optimizar tamaño)
RUN npm ci --only=production && npm cache clean --force

# ============================================
# ETAPA 2: Builder (desarrollo)
# ============================================
FROM node:22.18.0-alpine AS development

WORKDIR /app

# Copiar dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente del backend
COPY backend/ ./

# Exponer el puerto del backend
EXPOSE 8000

# Variables de entorno por defecto (se pueden sobrescribir)
ENV NODE_ENV=development
ENV PORT=8000

# Comando para desarrollo (con hot-reload)
CMD ["npm", "run", "dev"]

# ============================================
# ETAPA 3: Production
# ============================================
FROM node:22.18.0-alpine AS production

WORKDIR /app

# Copiar solo node_modules de producción
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY backend/ ./

# Exponer puerto
EXPOSE 8000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8000

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Comando de producción
CMD ["npm", "start"]