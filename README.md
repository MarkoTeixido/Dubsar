<div align="center">

# 🤖 Dubsar AI

### Plataforma de Chat Inteligente con IA

*Chat conversacional potenciado por Google Gemini con soporte para usuarios anónimos y autenticados*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-562%20passing-success?style=for-the-badge&logo=vitest)](https://vitest.dev/)

[🚀 Demo en Vivo](#) • [📖 Documentación](#características) • [🐛 Reportar Bug](https://github.com/marko-github/Dubsar/issues) • [✨ Solicitar Feature](https://github.com/marko-github/Dubsar/issues)

<img src="https://via.placeholder.com/800x400/0F172A/10B981?text=Dubsar+AI+Screenshot" alt="Dubsar AI Preview" width="100%" />

</div>

---

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Stack Tecnológico](#-stack-tecnológico)
- [📦 Instalación](#-instalación)
- [🔧 Configuración](#-configuración)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [📊 Métricas del Proyecto](#-métricas-del-proyecto)
- [🤝 Contribuir](#-contribuir)
- [📝 Licencia](#-licencia)

---

## ✨ Características

### 🎯 Características Principales

- **🤖 Chat con IA Avanzada**: Integración con Google Gemini 2.0 Flash
- **👤 Autenticación Completa**: Email/Password + OAuth (Google)
- **🌐 Chat Anónimo**: Usa la plataforma sin necesidad de registro
- **💬 Conversaciones Persistentes**: Guarda y retoma tus chats
- **📁 Upload de Archivos**: Soporta imágenes y documentos
- **⚡ Streaming de Respuestas**: Respuestas en tiempo real
- **🎨 UI/UX Moderna**: Diseño limpio con Shadcn UI y Framer Motion
- **📱 Responsive**: Optimizado para móvil, tablet y desktop
- **♿ Accesible**: Cumple estándares ARIA y WCAG
- **🔒 Seguro**: JWT, RLS en PostgreSQL, validaciones

### 🛠️ Características Técnicas

- **562+ Tests Automatizados**: Unit, Integration y E2E
- **~85-90% Code Coverage**: Alta cobertura de código
- **CI/CD Completo**: GitHub Actions + Deploy automático
- **Type Safety**: TypeScript en todo el stack
- **API RESTful**: Backend con Express.js
- **Real-time Updates**: Sincronización en tiempo real
- **Error Handling**: Manejo robusto de errores
- **Logging**: Sistema de logs estructurados

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  Next.js 15 + React 19 + TypeScript + TailwindCSS          │
│  • Páginas: Landing, Chat, Auth, Dashboard                 │
│  • Components: Shadcn UI + Radix UI                         │
│  • State: React Hooks                                       │
│  • Animations: Framer Motion                                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │ axios
┌────────────────────▼────────────────────────────────────────┐
│                         BACKEND                             │
│  Node.js + Express.js + JavaScript                          │
│  • Routes: /auth, /chat, /conversations, /files            │
│  • Middlewares: Auth, Validation, Error Handling           │
│  • Services: Business Logic Layer                          │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           │                      │
    ┌──────▼──────┐        ┌─────▼──────┐
    │  Supabase   │        │   Gemini   │
    │  PostgreSQL │        │  API 2.0   │
    │  + Auth     │        │            │
    │  + Storage  │        └────────────┘
    └─────────────┘
```

---

## 🚀 Stack Tecnológico

### Frontend

| Tecnología | Versión | Descripción |
|-----------|---------|-------------|
| **Next.js** | 15.5.5 | Framework React con SSR y Turbopack |
| **React** | 19.1.0 | Biblioteca UI con hooks y suspense |
| **TypeScript** | 5.x | Tipado estático |
| **TailwindCSS** | 4.x | Estilos utility-first |
| **Shadcn UI** | Latest | Componentes accesibles |
| **Framer Motion** | 12.x | Animaciones fluidas |
| **Radix UI** | Latest | Primitivos UI accesibles |
| **Axios** | 1.12.2 | Cliente HTTP |
| **React Markdown** | 10.x | Renderizado de markdown |

### Backend

| Tecnología | Versión | Descripción |
|-----------|---------|-------------|
| **Node.js** | 20.x | Runtime JavaScript |
| **Express.js** | Latest | Framework web minimalista |
| **Supabase** | Latest | BaaS con PostgreSQL |
| **Google Gemini** | 2.0 Flash | IA generativa |
| **Multer** | Latest | Upload de archivos |
| **CORS** | Latest | Cross-Origin Resource Sharing |

### Testing

| Herramienta | Tests | Cobertura |
|------------|-------|-----------|
| **Vitest** | 527 | ~85% |
| **Playwright** | 35 | E2E completo |
| **Testing Library** | ✓ | React components |

### DevOps

| Servicio | Uso |
|----------|-----|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **GitHub Actions** | CI/CD |
| **Supabase** | Database + Auth |

---

## 📦 Instalación

### Prerequisitos

- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **Git**: >= 2.x
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Google AI Studio](https://aistudio.google.com)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/marko-github/Dubsar.git
cd Dubsar
```

### 2️⃣ Instalar Frontend

```bash
cd frontend
npm install
```

### 3️⃣ Instalar Backend

```bash
cd ../backend
npm install
```

---

## 🔧 Configuración

### Frontend Environment Variables

Crear `frontend/.env.local`:

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment Variables

Crear `backend/.env`:

```bash
# Server
PORT=8000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GOOGLE_API_KEY=your-gemini-api-key
```

### 📋 Obtener Credenciales

**Supabase:**
1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a Settings > API
4. Copiar: URL, anon key, service_role key

**Google Gemini:**
1. Ir a [aistudio.google.com](https://aistudio.google.com)
2. Click en "Get API Key"
3. Crear nuevo proyecto o usar existente
4. Copiar API Key

---

## 🚀 Ejecutar en Desarrollo

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Backend corriendo en: `http://localhost:8000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend corriendo en: `http://localhost:3000`

### Verificar Funcionamiento

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:8000/health
- **Backend API**: http://localhost:8000

---

## 🧪 Testing

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Todos los tests
npm test

# Coverage
npm run test:coverage
```

### 📊 Resultados Actuales

```
Frontend:  265+ tests passing
Backend:   297 tests passing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:     562+ tests passing ✨
Cobertura: ~85-90%
```

---

## 🚀 Deployment

### Vercel (Frontend)

1. Push a GitHub
2. Importar repo en [vercel.com](https://vercel.com)
3. Configurar:
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detectado)
   - Variables de entorno:
     ```
     NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
     ```
4. Deploy ✅

### Render (Backend)

1. Crear Web Service en [render.com](https://render.com)
2. Conectar repo: `marko-github/Dubsar`
3. Configurar:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Variables de entorno (ver arriba)
4. Deploy ✅

---

## 📊 Métricas del Proyecto

```
📁 Total Files:         180+
📝 Lines of Code:       15,000+
🧪 Tests:               562+
📊 Code Coverage:       85-90%
⚡ Build Time:          ~30s (frontend) / ~15s (backend)
🎯 Lighthouse Score:    95+ (Performance, Accessibility, SEO)
```

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Marko**
- GitHub: [@marko-github](https://github.com/marko-github)
- LinkedIn: [Tu LinkedIn](#)
- Portfolio: [Tu Portfolio](#)

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Google Gemini](https://ai.google.dev/) - IA Generativa
- [Shadcn UI](https://ui.shadcn.com/) - Componentes UI
- [Vercel](https://vercel.com/) - Hosting Frontend
- [Render](https://render.com/) - Hosting Backend

---

## 📈 Roadmap

- [ ] Sistema de temas (Dark/Light mode)
- [ ] Soporte multiidioma (i18n)
- [ ] Búsqueda en conversaciones
- [ ] Export de conversaciones (PDF, TXT)
- [ ] Comandos de voz
- [ ] Compartir conversaciones
- [ ] Integración con más modelos de IA
- [ ] App móvil nativa

---

<div align="center">


</div>