# 🚀 Dubsar AI - Backend

Backend de la aplicación Dubsar AI, un chatbot inteligente potenciado por Google Gemini AI con autenticación, gestión de conversaciones y procesamiento de archivos.

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 22.18.0
- **Framework**: Express.js 5.1.0
- **Base de datos**: PostgreSQL (Supabase)
- **IA**: Google Gemini 2.5 Flash
- **Autenticación**: Supabase Auth (JWT + OAuth)
- **Testing**: Vitest
- **Containerización**: Docker

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                 # Configuración de Express
│   ├── config/                # Configuraciones (DB, Gemini)
│   ├── controllers/           # Lógica de negocio
│   ├── middlewares/           # Middlewares (auth, errores)
│   ├── routes/                # Definición de rutas
│   ├── services/              # Servicios (AI, archivos)
│   └── utils/                 # Utilidades
├── tests/
│   ├── unit/                  # Tests unitarios
│   ├── integration/           # Tests de integración
│   └── setup/                 # Configuración de tests
├── server.js                  # Punto de entrada
├── package.json
└── vitest.config.js
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22.18.0 o superior
- npm 10.x
- Cuenta de Supabase
- API Key de Google Gemini AI

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar/backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Variables de Entorno

Crea un archivo `.env` en la raíz de `backend/`:

```env
# Servidor
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Google Gemini AI
GOOGLE_API_KEY=tu_api_key_aqui

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key
```

#### ¿Dónde obtener las credenciales?

- **Google AI API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Supabase**: [Supabase Dashboard](https://supabase.com/dashboard) → Tu Proyecto → Settings → API

### Ejecutar en Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run dev

# Servidor iniciará en http://localhost:8000
```

### Ejecutar con Docker

```bash
# Desde la raíz del proyecto
docker compose -f infra/docker/docker-compose.dev.yml up backend
```

## 📊 API Endpoints

### Públicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servidor |
| GET | `/health` | Estado del servidor |
| POST | `/chat` | Chat sin streaming |
| POST | `/chat/stream` | Chat con streaming (SSE) |

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/refresh` | Refrescar token |
| POST | `/auth/forgot-password` | Recuperar contraseña |
| POST | `/auth/reset-password` | Resetear contraseña |
| GET | `/auth/me` | Perfil del usuario |
| PATCH | `/auth/profile` | Actualizar perfil |
| DELETE | `/auth/account` | Eliminar cuenta |
| GET | `/auth/oauth/google` | OAuth con Google |

### Conversaciones (Requiere autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/conversations` | Crear nueva conversación |
| GET | `/conversations` | Listar conversaciones del usuario |
| GET | `/conversations/:id/messages` | Obtener mensajes de una conversación |
| PUT | `/conversations/:id` | Actualizar título de conversación |
| DELETE | `/conversations/:id` | Eliminar conversación |

### Archivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/files/upload` | Subir archivo (PDF, DOCX, imagen) |
| GET | `/files/status` | Estado de límites de archivos |

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests en modo watch
npm run test:watch

# Reporte de cobertura
npm run test:coverage
```

## 🔐 Características de Seguridad

- ✅ Autenticación JWT con Supabase
- ✅ OAuth 2.0 con Google
- ✅ Rate limiting para usuarios anónimos
- ✅ Validación de entrada en todos los endpoints
- ✅ CORS configurado
- ✅ Headers de seguridad
- ✅ Sanitización de datos

## 📝 Límites y Restricciones

### Usuarios Anónimos
- **Mensajes por día**: 20
- **Tamaño de archivos**: No permitido

### Usuarios Autenticados
- **Mensajes por día**: Ilimitados
- **Tamaño máximo de archivo**: 10MB
- **Archivos por día**: 50
- **Formatos soportados**: PDF, DOCX, PNG, JPG, JPEG, WEBP

## 🤖 Gemini AI

El backend utiliza **Google Gemini 2.5 Flash** con las siguientes características:

- Streaming de respuestas en tiempo real
- Procesamiento de imágenes
- Análisis de documentos (PDF, Word)
- Contexto conversacional
- Safety settings configurados

## 🐛 Debugging

```bash
# Logs detallados
DEBUG=* npm run dev

# Ver conexiones de base de datos
# Los logs muestran:
# ✅ Supabase conectado
# ✅ Gemini AI conectado
```

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Modo desarrollo con hot-reload |
| `npm test` | Ejecuta todos los tests |
| `npm run test:unit` | Tests unitarios |
| `npm run test:integration` | Tests de integración |
| `npm run test:coverage` | Reporte de cobertura |

## 🚀 Deployment

### Render (Recomendado)

1. Conecta tu repositorio a Render
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

### Docker

```bash
# Build
docker build -f infra/docker/backend.Dockerfile -t dubsar-backend .

# Run
docker run -p 8000:8000 --env-file .env dubsar-backend
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo [LICENSE](../LICENSE) para más detalles.

## 👨‍💻 Autor

**Marko Teixido**
- GitHub: [@MarkoTeixido](https://github.com/MarkoTeixido)
- Email: teixido_marko@outlook.es

## 🙏 Agradecimientos

- Google Gemini AI
- Supabase
- Express.js Community

---

**Versión**: 2.0.0 