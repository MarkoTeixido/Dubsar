# ============================================
# ETAPA 1: Dependencias
# ============================================
FROM node:22.18.0-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar archivos de dependencias
COPY frontend/package*.json ./

# Instalar todas las dependencias (necesarias para build)
RUN npm ci && npm cache clean --force

# ============================================
# ETAPA 2: Builder
# ============================================
FROM node:22.18.0-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY frontend/ ./

# Variable de entorno para el build (apunta al backend en Docker)
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Construir la aplicación Next.js
RUN npm run build

# ============================================
# ETAPA 3: Production
# ============================================
FROM node:22.18.0-alpine AS production

WORKDIR /app

# Copiar solo lo necesario para correr Next.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exponer puerto
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Comando de producción
CMD ["node", "server.js"]

# ============================================
# ETAPA 4: Development (con hot-reload)
# ============================================
FROM node:22.18.0-alpine AS development

WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY frontend/ ./

# Exponer puerto
EXPOSE 3000

ENV NODE_ENV=development
ENV PORT=3000

# Comando para desarrollo
CMD ["npm", "run", "dev"]