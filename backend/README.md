<p align="center">
  <a href="https://dubsarai.vercel.app/"><img src="https://i.imgur.com/npJju1C.png" height="128"></a>
  <h2 align="center"><a href="https://dubsarai.vercel.app/">Dubsar AI - Backend</a></h2>
  <p align="center">API REST potenciada por Google Gemini AI con autenticación y gestión de conversaciones<p>
  <p align="center">
    <a href="#-características">
    	<img src="https://img.shields.io/badge/%E2%9C%A8-Características-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="características" />
    </a>
    <a href="#-api-endpoints">
    	<img src="https://img.shields.io/badge/%F0%9F%93%A1-API%20Endpoints-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="api" />
    </a>
    <a href="#-testing">
    	<img src="https://img.shields.io/badge/%F0%9F%A7%AA-Testing-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="testing" />
    </a>
    <a href="#-deployment">
    	<img src="https://img.shields.io/badge/%F0%9F%9A%80-Deployment-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="deployment" />
    </a>
  </p>
</p>

<br>

![](https://i.imgur.com/waxVImv.png)

## 🛠️ Stack Tecnológico

Backend moderno construido con tecnologías del ecosistema Node.js:

| Tecnología | Versión | Descripción |
|-----------|---------|-------------|
| **Node.js** | 22.18.0 | Runtime JavaScript de alto rendimiento |
| **Express.js** | 5.1.0 | Framework web minimalista y flexible |
| **PostgreSQL** | Latest | Base de datos relacional vía Supabase |
| **Google Gemini** | 2.5 Flash | IA generativa de última generación |
| **Supabase Auth** | Latest | Autenticación JWT + OAuth integrada |
| **Vitest** | Latest | Framework de testing ultrarrápido |
| **Docker** | Latest | Containerización y despliegue |

![](https://i.imgur.com/waxVImv.png)

## ✨ Características

### 🎯 Core Features

- **🤖 Integración con Gemini AI**: Modelo 2.5 Flash con streaming en tiempo real
- **🔐 Autenticación Completa**: JWT + OAuth (Google) + recuperación de contraseña
- **💬 Gestión de Conversaciones**: CRUD completo con historial persistente
- **📎 Procesamiento de Archivos**: Upload y análisis de PDF, DOCX e imágenes
- **⚡ Streaming SSE**: Respuestas de IA en tiempo real
- **🛡️ Rate Limiting**: Límites configurables por tipo de usuario
- **📊 Validación Robusta**: Sanitización y validación de todas las entradas

### 🔒 Seguridad

- ✅ Headers de seguridad (Helmet.js)
- ✅ CORS configurado correctamente
- ✅ Validación de entrada en todos los endpoints
- ✅ Sanitización de datos SQL injection-proof
- ✅ JWT con refresh tokens
- ✅ Rate limiting anti-abuse

![](https://i.imgur.com/waxVImv.png)

## 📡 API Endpoints

### Públicos

```bash
GET  /              # Información del servidor
GET  /health        # Health check
POST /chat          # Chat sin streaming
POST /chat/stream   # Chat con streaming (SSE)
```

### Autenticación

```bash
POST   /auth/register         # Registro de usuario
POST   /auth/login            # Iniciar sesión
POST   /auth/logout           # Cerrar sesión
POST   /auth/refresh          # Refrescar token
POST   /auth/forgot-password  # Recuperar contraseña
POST   /auth/reset-password   # Resetear contraseña
GET    /auth/me               # Perfil del usuario
PATCH  /auth/profile          # Actualizar perfil
DELETE /auth/account          # Eliminar cuenta
GET    /auth/oauth/google     # OAuth Google
```

### Conversaciones (🔒 Requiere autenticación)

```bash
POST   /conversations              # Crear conversación
GET    /conversations              # Listar conversaciones
GET    /conversations/:id/messages # Obtener mensajes
PUT    /conversations/:id          # Actualizar título
DELETE /conversations/:id          # Eliminar conversación
```

### Archivos

```bash
POST /files/upload   # Subir archivo (PDF, DOCX, imagen)
GET  /files/status   # Estado de límites
```

![](https://i.imgur.com/waxVImv.png)

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js**: >= 22.18.0
- **npm**: >= 10.x
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Google AI Studio](https://aistudio.google.com)

### 1️⃣ Instalación

```bash
# Clonar repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar/backend

# Instalar dependencias
npm install
```

### 2️⃣ Configuración

Crear archivo `.env`:

![](https://i.imgur.com/V6gkvEY.png)

**¿Dónde obtener credenciales?**

- **Google AI**: [AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase**: Dashboard → Settings → API

### 3️⃣ Ejecutar

```bash
# Desarrollo
npm run dev

# Servidor en http://localhost:8000
```

![](https://i.imgur.com/waxVImv.png)

## 🧪 Testing

```bash
# Todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### 📊 Cobertura Actual

```
✓ 297 tests passing
━━━━━━━━━━━━━━━━━━━
Coverage: ~85-90%
```

![](https://i.imgur.com/waxVImv.png)

## 🚀 Deployment

### Render (Recomendado)

1. Conecta tu repositorio en [render.com](https://render.com)
2. Configuración:
   - **Root Directory**: `backend`
3. Agrega variables de entorno
4. Deploy

### Docker

```bash
# Build
docker build -f infra/docker/backend.Dockerfile -t dubsar-backend .

# Run
docker run -p 8000:8000 --env-file .env dubsar-backend
```

![](https://i.imgur.com/waxVImv.png)

## 📁 Estructura del Proyecto

![](https://i.imgur.com/SW7wQ1n.png)


![](https://i.imgur.com/waxVImv.png)

**Pasos para contribuir:**

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

![](https://i.imgur.com/waxVImv.png)

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Servidor de producción |
| `npm run dev` | Desarrollo con hot-reload |
| `npm test` | Ejecutar tests |
| `npm run test:unit` | Tests unitarios |
| `npm run test:integration` | Tests de integración |
| `npm run test:coverage` | Reporte de cobertura |

![](https://i.imgur.com/waxVImv.png)

---

<div align="center">

Hecho por [Marko Teixido](https://github.com/MarkoTeixido)

</div>