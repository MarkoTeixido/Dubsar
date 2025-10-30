<p align="center">
  <a href="https://dubsarai.vercel.app/"><img src="https://i.imgur.com/npJju1C.png" height="128"></a>
  <h2 align="center"><a href="https://dubsarai.vercel.app/">Dubsar AI - Frontend</a></h2>
  <p align="center">Interfaz moderna y elegante para chat con IA construida con Next.js 15, React 19 y TypeScript 5<p>
  <p align="center">
    <a href="#-características">
    	<img src="https://img.shields.io/badge/%E2%9C%A8-Características-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="características" />
    </a>
    <a href="#-componentes">
    	<img src="https://img.shields.io/badge/%F0%9F%8E%A8-Componentes-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="componentes" />
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

Frontend moderno construido con las últimas tecnologías de React:

| Tecnología | Versión | Descripción |
|-----------|---------|-------------|
| **Next.js** | 15.5.5 | Framework React con App Router y Turbopack |
| **React** | 19.1.0 | Biblioteca UI con hooks y suspense |
| **TypeScript** | 5.x | Tipado estático end-to-end |
| **TailwindCSS** | 4.x | Framework CSS utility-first |
| **Shadcn UI** | Latest | Componentes accesibles y reutilizables |
| **Framer Motion** | 12.x | Animaciones fluidas y declarativas |
| **Radix UI** | Latest | Primitivos UI accesibles |
| **Axios** | 1.12.2 | Cliente HTTP con interceptores |
| **React Markdown** | 10.x | Renderizado de markdown con GFM |
| **Vitest** | Latest | Testing ultrarrápido (unit/integration) |
| **Playwright** | Latest | Tests end-to-end (e2e) |

![](https://i.imgur.com/waxVImv.png)

## ✨ Características

### 🎨 Interfaz de Usuario

- **🌓 Dark Mode Nativo**: Tema oscuro optimizado para lectura prolongada
- **📱 Totalmente Responsive**: Diseño adaptable para móvil, tablet y desktop
- **✨ Animaciones Fluidas**: Transiciones suaves con Framer Motion
- **🎯 UX Optimizada**: Diseño minimalista centrado en el usuario

### 💬 Chat Inteligente

- **⚡ Streaming en Tiempo Real**: Respuestas de IA tipo ChatGPT
- **📝 Renderizado Markdown**: Soporte completo de markdown con syntax highlighting
- **🖼️ Soporte Multimedia**: Previsualización de imágenes y documentos
- **📚 Historial Persistente**: Guarda y recupera conversaciones
- **🔄 Auto-scroll Inteligente**: Scroll automático con control manual

### 🔐 Autenticación

- **📧 Email/Password**: Registro e inicio de sesión tradicional
- **🔑 OAuth Google**: Autenticación social rápida
- **🔒 Sesión Persistente**: Mantén tu sesión entre visitas
- **👤 Gestión de Perfil**: Actualiza tu información personal
- **🔓 Recuperación**: Sistema completo de reset de contraseña

### 📎 Gestión de Archivos

- **🖼️ Imágenes**: PNG, JPG, JPEG, WEBP con preview
- **📄 Documentos**: PDF, DOCX con análisis por IA
- **📊 Límites Inteligentes**: Diferentes cuotas por tipo de usuario

### 🚀 Performance

- **⚡ Lighthouse 95+**: Optimizado para máxima velocidad
- **📦 Code Splitting**: Carga solo lo necesario
- **🖼️ Image Optimization**: Imágenes optimizadas automáticamente
- **🔥 Turbopack**: Builds ultrarrápidos en desarrollo
- **♿ Accesibilidad 100**: Cumple WCAG 2.1 AA

![](https://i.imgur.com/waxVImv.png)

## 🎨 Componentes

### Componentes Shadcn UI

El proyecto utiliza **Shadcn UI** para componentes reutilizables:

```bash
# Agregar nuevos componentes de shadcn
npx shadcn-ui@latest add [NombreComponente]
```

**Componentes implementados en carpeta components/ui/:**
- `button`, `input`, `textarea`
- `card`, `alert_dialog`
- `skeleton`, `separator`, `tooltip`
- `sidebar`, `sheet`

### Estructura de Componentes

![](https://i.imgur.com/D5Ddb4o.png)

![](https://i.imgur.com/waxVImv.png) 

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js**: >= 22.18.0
- **npm**: >= 10.x
- Backend de Dubsar corriendo

### 1️⃣ Instalación

```bash
# Clonar repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar/frontend

# Instalar dependencias
npm install
```

### 2️⃣ Configuración

Crear archivo `.env.local`:

```env
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Para producción:
```env
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
```

### 3️⃣ Ejecutar

```bash
# Desarrollo con Turbopack
npm run dev

# Abrir http://localhost:3000
```

![](https://i.imgur.com/waxVImv.png)

## 🧪 Testing

### Tests Unitarios e Integración (Vitest)

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Modo watch interactivo
npm run test:ui

# Cobertura de código
npm run test:coverage
```

### Tests End-to-End (Playwright)

```bash
# Ejecutar tests E2E
npm run test:e2e

# Modo UI (interactivo)
npm run test:e2e:ui

# Modo headless
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Ver reporte HTML
npm run test:e2e:report
```

### 📊 Resultados Actuales

```
✓ 265+ tests passing (Vitest)
✓ 35 E2E tests (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 300+ tests ✨
Coverage: ~85-90%
```

![](https://i.imgur.com/waxVImv.png)

## 🚀 Deployment

### Vercel (Recomendado)

**desde el Dashboard:**

1. Importa tu repo en [vercel.com](https://vercel.com)
2. Configuración:
   - **Framework**: Next.js (auto-detectado)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
3. Variables de entorno:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com
   ```
4. Deploy

### Docker

```bash
# Build
docker build -f infra/docker/frontend.Dockerfile -t dubsar-frontend .

# Run
docker run -p 3000:3000 dubsar-frontend
```

![](https://i.imgur.com/waxVImv.png)

## 📁 Estructura del Proyecto

![](https://i.imgur.com/Su5NGnb.png)

![](https://i.imgur.com/waxVImv.png)

## 🎯 Performance

### Optimizaciones Implementadas

- ✅ Server Components por defecto
- ✅ Image optimization con `next/image`
- ✅ Dynamic imports para code splitting
- ✅ Turbopack para builds rápidos
- ✅ Font optimization con `next/font`
- ✅ Lazy loading de componentes pesados
- ✅ Memoization de componentes React

### Lighthouse Score

```
Performance:      92+
Accessibility:    100
Best Practices:   100
SEO:             100
```

![](https://i.imgur.com/waxVImv.png)

## 🐛 Debugging

### En Desarrollo

```bash
# Logs detallados
DEBUG=* npm run dev

# Analizar bundle
npm run build -- --profile

# Inspeccionar Turbopack
npm run dev -- --show-all
```

### Troubleshooting Común

**Error: Cannot connect to backend**
```bash
# Verificar backend
curl http://localhost:8000/health

# Verificar .env.local
cat .env.local
```

**Error: Hydration mismatch**
```bash
# Limpiar caché
rm -rf .next
npm run dev
```

**Error: Module not found**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

![](https://i.imgur.com/waxVImv.png)

## 📝 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm test` | Tests unitarios + integración |
| `npm run test:e2e` | Tests end-to-end |
| `npm run test:ui` | Tests en modo UI |
| `npm run test:coverage` | Reporte de cobertura |

![](https://i.imgur.com/waxVImv.png)

### Guía de Estilo

- ✅ Usa TypeScript para todos los archivos
- ✅ Sigue las convenciones de Next.js App Router
- ✅ Componentes en PascalCase
- ✅ Hooks con prefijo `use`
- ✅ Mantén componentes pequeños y reutilizables
- ✅ Escribe tests para nuevas funcionalidades

![](https://i.imgur.com/waxVImv.png)

---

<div align="center">

Hecho por [Marko Teixido](https://github.com/MarkoTeixido)

</div>