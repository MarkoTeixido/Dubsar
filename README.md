<p align="center">
  <a href="https://dubsarai.vercel.app/"><img src="https://i.imgur.com/npJju1C.png" height="128"></a>
  <h2 align="center"><a href="https://dubsarai.vercel.app/">Dubsar AI</a></h2>
  <p align="center">App web de asistencia conversacional inteligente, potenciada por IA generativa y diseñada para ofrecer respuestas en tiempo real a usuarios autenticados o anónimos.<p>
  <p align="center">
    <a href="https://dubsarai.vercel.app/">
    	<img src="https://img.shields.io/badge/%F0%9F%8C%90-Demo_en_Vivo-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="demo" />
    </a>
    <a href="#-características">
    	<img src="https://img.shields.io/badge/%E2%9C%A8-Características-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="características" />
    </a>
    <a href="#-tecnologías">
    	<img src="https://img.shields.io/badge/%F0%9F%9A%80-Stack-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="stack" />
    </a>
    <a href="#-instalación">
    	<img src="https://img.shields.io/badge/%F0%9F%93%A6-Instalación-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="instalación" />
    </a>
  </p>
</p>

<br>

![](https://i.imgur.com/waxVImv.png)

## 📝 Sobre el Proyecto

**Dubsar AI** es una aplicación web full-stack que permite interactuar con Google Gemini AI a través de una interfaz moderna y minimalista. Desarrollada como proyecto personal para demostrar habilidades en desarrollo web moderno, arquitectura de software y buenas prácticas de programación.

### 🎯 Objetivo

Crear una plataforma de chat con IA que sea:
- **Rápida**: Respuestas en streaming en tiempo real
- **Segura**: Autenticación robusta y protección de datos
- **Escalable**: Arquitectura modular y bien estructurada
- **Testeable**: Alta cobertura de tests automatizados
- **Profesional**: Código limpio y documentado

### 🖼️ Preview
<p align="center">
   <img src="https://i.imgur.com/v5sS2AK.png" height="600" width="750">
</p>

![](https://i.imgur.com/waxVImv.png)

## ✨ Características

### 🤖 Inteligencia Artificial

- **Google Gemini 2.5 Flash**: Modelo de IA de última generación
- **Streaming de Respuestas**: Respuestas en tiempo real tipo ChatGPT
- **Análisis de Imágenes**: Procesamiento y comprensión de imágenes
- **Procesamiento de Documentos**: Análisis de PDFs y archivos Word
- **Contexto Conversacional**: Mantiene el hilo de la conversación

### 🔐 Autenticación y Usuarios

- **Modo Anónimo**: Usa la app sin necesidad de registro (límite: 20 mensajes/día)
- **Registro Email/Password**: Autenticación tradicional con Supabase
- **OAuth Google**: Login rápido con cuenta de Google
- **Gestión de Sesión**: JWT tokens con refresh automático
- **Perfiles de Usuario**: Actualización de datos personales

### 💬 Gestión de Conversaciones

- **Múltiples Chats**: Crea y organiza diferentes conversaciones
- **Persistencia**: Guarda todo tu historial de chats
- **Títulos Personalizados**: Renombra tus conversaciones
- **Eliminación**: Borra conversaciones individuales
- **Sincronización**: Accede a tus chats desde cualquier dispositivo

### 📎 Manejo de Archivos

- **Upload de Imágenes**: PNG, JPG, JPEG, WEBP
- **Documentos**: PDF y DOCX
- **Límites Inteligentes**: 10MB por archivo, 50 archivos/día para usuarios registrados
- **Vista Previa**: Previsualiza archivos antes de enviar
- **Almacenamiento Seguro**: Supabase Storage con URLs firmadas

### 🎨 Interfaz de Usuario

- **Diseño Minimalista**: Inspirado en las mejores apps de IA
- **Dark Mode**: Tema oscuro optimizado para lectura prolongada
- **Responsive**: Funciona perfectamente en móvil, tablet y desktop
- **Animaciones Fluidas**: Transiciones con Framer Motion
- **Markdown Rendering**: Código, tablas, listas y más
- **Accesibilidad**: Cumple estándares WCAG

![](https://i.imgur.com/waxVImv.png)

## 🏗️ Arquitectura

<p align="center">
   <img src="https://i.imgur.com/IuwRYXF.png">
</p>

### 🔄 Flujo de una Conversación

<p align="center">
   <img src="https://i.imgur.com/ZCNX88n.png">
</p>


![](https://i.imgur.com/waxVImv.png)

## 🚀 Tecnologías

### Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Next.js** | 15.5.5 | Framework React con App Router y SSR |
| **React** | 19.1.0 | Biblioteca UI con hooks modernos |
| **TypeScript** | 5.x | Tipado estático para mayor seguridad |
| **TailwindCSS** | 4.x | Estilos utility-first |
| **Shadcn UI** | Latest | Componentes accesibles pre-construidos |
| **Framer Motion** | 12.x | Animaciones declarativas |
| **Radix UI** | Latest | Primitivos UI sin estilos |
| **Axios** | 1.12.2 | Cliente HTTP |
| **React Markdown** | 10.x | Renderizado de markdown |

### Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Node.js** | 22.18.0 | Runtime JavaScript |
| **Express.js** | 5.1.0 | Framework web minimalista |
| **Supabase** | 2.75.0 | BaaS (Auth, DB, Storage) |
| **Google Generative AI** | 0.24.1 | SDK de Gemini AI |
| **Multer** | 2.0.2 | Middleware para file uploads |
| **PDF Parse** | 2.3.8 | Extracción de texto de PDFs |
| **Mammoth** | 1.11.0 | Conversión de DOCX a HTML |
| **Pino** | 10.1.0 | Logger de alto rendimiento |

### Testing

| Herramienta | Tests | Uso |
|------------|-------|-----|
| **Vitest** | 527 | Tests unitarios e integración |
| **Playwright** | 35 | Tests end-to-end |
| **Testing Library** | ✓ | Testing de componentes React |
| **Supertest** | ✓ | Testing de API REST |

**Cobertura total**: +90% del código

### DevOps

| Servicio | Uso |
|----------|-----|
| **Vercel** | Hosting del frontend |
| **Render** | Hosting del backend |
| **GitHub Actions** | CI/CD automático |
| **Docker** | Containerización |
| **Supabase** | Base de datos y autenticación |

![](https://i.imgur.com/waxVImv.png)

## 📦 Instalación

### Prerequisitos

- Node.js >= 22.18.0
- npm >= 10.x
- Cuenta en [Supabase](https://supabase.com) (gratis)
- API Key de [Google AI Studio](https://aistudio.google.com) (gratis)

### Opción 1: Setup Automático (Recomendado)

**Linux/macOS:**
```bash
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar
chmod +x infra/scripts/setup-dev.sh
./infra/scripts/setup-dev.sh
```

**Windows:**
```powershell
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar
.\infra\scripts\setup-dev.ps1
```

El script automáticamente:
- ✅ Verifica prerequisitos
- ✅ Instala dependencias
- ✅ Crea archivos `.env`
- ✅ Muestra próximos pasos

### Opción 2: Setup Manual

<details>
<summary><b>Ver instrucciones paso a paso</b></summary>

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar
```

#### 2. Instalar Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

#### 3. Configurar Variables de Entorno

**Backend** - Crear `backend/.env`:

![](https://i.imgur.com/V6gkvEY.png)

**Frontend** - Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 4. Obtener Credenciales

**Google Gemini AI:**
1. Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click en "Get API Key"
3. Crear o seleccionar un proyecto
4. Copiar la API Key

**Supabase:**
1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a Settings → API
4. Copiar: URL del proyecto, `anon` key, `service_role` key

#### 5. Ejecutar en Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Servidor en http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicación en http://localhost:3000
```

</details>

### Opción 3: Docker

```bash
# Desde la raíz del proyecto
docker compose -f infra/docker/docker-compose.dev.yml up

# Acceder a:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

![](https://i.imgur.com/waxVImv.png)

## 🧪 Testing

Este proyecto cuenta con **562+ tests automatizados** con ~85-90% de cobertura:

### Backend (297 tests)

```bash
cd backend

# Todos los tests
npm test

# Solo unitarios
npm run test:unit

# Solo integración
npm run test:integration

# Con coverage
npm run test:coverage
```

**Tests incluyen:**
- ✅ Endpoints de autenticación
- ✅ CRUD de conversaciones
- ✅ Integración con Gemini AI
- ✅ Upload de archivos
- ✅ Middlewares de seguridad
- ✅ Manejo de errores

### Frontend (265+ tests)

```bash
cd frontend

# Tests unitarios e integración
npm test

# Tests E2E con Playwright
npm run test:e2e

# Coverage completo
npm run test:coverage
```

**Tests incluyen:**
- ✅ Componentes UI
- ✅ Hooks personalizados
- ✅ Integración con API
- ✅ Flujos de autenticación
- ✅ E2E de usuario completo

### Resultados

```
Backend:   297 tests passing  ✓
Frontend:  265+ tests passing ✓
E2E:       35 tests passing   ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:     562+ tests         ✨
Coverage:  +90%             📊
```

![](https://i.imgur.com/waxVImv.png)

## 📊 Estructura del Proyecto

![](https://i.imgur.com/lLge2LG.png)


![](https://i.imgur.com/waxVImv.png)

## 🚀 Deployment

### Aplicación Desplegada

- **Frontend**: [dubsarai.vercel.app](https://dubsarai.vercel.app/)
- **Backend**: Render.com (URL privada)

### CI/CD Pipeline

El proyecto incluye **GitHub Actions** que automáticamente:

1. **En cada Push/PR:**
   - ✅ Ejecuta linting
   - ✅ Corre todos los tests
   - ✅ Verifica cobertura
   - ✅ Build de Docker images

2. **En Push a `main`:**
   - ✅ Deploy automático a Vercel (frontend)
   - ✅ Deploy automático a Render (backend)
   - ✅ Health check post-deploy

3. **Cada hora:**
   - ✅ Health check del backend en producción
   - ✅ Alertas si algo falla

Ver configuración completa en [`.github/workflows/`](.github/workflows/)

![](https://i.imgur.com/waxVImv.png)

## 🎓 Aprendizajes y Decisiones Técnicas

### ¿Por qué Next.js 15?

- App Router para mejor organización
- Server Components para performance
- Turbopack para builds ultrarrápidos
- Built-in optimizaciones de imágenes y fonts

### ¿Por qué Express.js?

- Minimalista y flexible
- Gran ecosistema de middlewares
- Fácil de testear y escalar
- Excelente documentación

### ¿Por qué Supabase?

- PostgreSQL completo (no solo auth)
- Row Level Security (RLS)
- Storage integrado
- Real-time capabilities (futuro)
- Free tier generoso

### ¿Por qué Google Gemini?

- Modelo de última generación
- Excelente relación precio/calidad
- Soporte nativo de streaming
- Multimodal (texto, imágenes, documentos)
- API simple y bien documentada

![](https://i.imgur.com/waxVImv.png)

## 📚 Documentación Adicional

- [📖 Frontend README](frontend/README.md) - Detalles del frontend
- [📖 Backend README](backend/README.md) - Detalles del backend
- [🐳 Infraestructura](infra/README.md) - Docker y scripts
- [⚙️ GitHub Actions](.github/README.md) - CI/CD workflows

![](https://i.imgur.com/waxVImv.png)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

![](https://i.imgur.com/waxVImv.png)

## 👨‍💻 autor

**Marko Teixido**

- GitHub: [@MarkoTeixido](https://github.com/MarkoTeixido)
- Sitio: [Portfolio](https:markoteixido.site)

---