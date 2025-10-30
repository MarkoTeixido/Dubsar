# ✨ Dubsar AI - Frontend

Frontend moderno de Dubsar AI, un chatbot inteligente con interfaz elegante y minimalista construida con Next.js 15 y React 19.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.5.5 (App Router)
- **React**: 19.1.0
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Radix UI
- **Animaciones**: Framer Motion
- **HTTP Client**: Axios
- **Markdown**: React Markdown + Remark GFM
- **Testing**: Vitest + Playwright + Testing Library
- **Build Tool**: Turbopack

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página de inicio (chat)
│   │   └── globals.css        # Estilos globales
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes de Shadcn UI
│   │   └── ...                # Componentes custom
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y helpers
│   └── types/                 # Tipos de TypeScript
├── public/                    # Archivos estáticos
├── tests/
│   ├── unit/                  # Tests unitarios
│   ├── integration/           # Tests de integración
│   └── e2e/                   # Tests end-to-end (Playwright)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 22.18.0 o superior
- npm 10.x
- Backend de Dubsar corriendo

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MarkoTeixido/Dubsar.git
cd Dubsar/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local
```

### Variables de Entorno

Crea un archivo `.env.local` en la raíz de `frontend/`:

```env
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Para producción:
```env
NEXT_PUBLIC_API_URL=https://tu-backend.render.com
```

### Ejecutar en Desarrollo

```bash
# Modo desarrollo con Turbopack
npm run dev

# Abrir http://localhost:3000
```

### Ejecutar con Docker

```bash
# Desde la raíz del proyecto
docker compose -f infra/docker/docker-compose.dev.yml up frontend
```

## 🏗️ Build para Producción

```bash
# Generar build optimizado
npm run build

# Iniciar servidor de producción
npm start
```

## 🧪 Testing

### Tests Unitarios e Integración (Vitest)

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Modo watch
npm run test:ui

# Cobertura
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

# Ver reporte
npm run test:e2e:report
```

## ✨ Características

### 🎨 Interfaz de Usuario

- ✅ Diseño minimalista y moderno
- ✅ Dark mode nativo
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Animaciones fluidas con Framer Motion
- ✅ Tipografía optimizada (Geist Sans)

### 💬 Chat

- ✅ Streaming de respuestas en tiempo real
- ✅ Renderizado de Markdown con syntax highlighting
- ✅ Soporte de imágenes y archivos
- ✅ Historial de conversaciones
- ✅ Auto-scroll inteligente

### 🔐 Autenticación

- ✅ Login / Registro con email
- ✅ OAuth con Google
- ✅ Recuperación de contraseña
- ✅ Gestión de perfil
- ✅ Persistencia de sesión

### 📎 Archivos

- ✅ Upload de imágenes (PNG, JPG, WEBP)
- ✅ Upload de documentos (PDF, DOCX)
- ✅ Vista previa de archivos
- ✅ Límites por tipo de usuario

### 📱 Características Adicionales

- ✅ PWA Ready (instalable)
- ✅ SEO optimizado
- ✅ Performance optimizado (Lighthouse 90+)
- ✅ Accesibilidad (ARIA labels)
- ✅ Lazy loading de componentes

## 🎨 Componentes UI

El proyecto utiliza **Shadcn UI** para componentes reutilizables:

```bash
# Agregar un nuevo componente
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add avatar
```

Componentes disponibles:
- `Button`, `Input`, `Textarea`
- `Dialog`, `Alert Dialog`
- `Avatar`, `Separator`, `Tooltip`
- `Tabs`, `Slot`

## 🔧 Configuración

### Tailwind CSS

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        // ...colores personalizados
      },
    },
  },
}
```

### Next.js

```typescript
// next.config.ts
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lhnsfwdbgysybprsdsqq.supabase.co'],
  },
}
```

## 📊 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm test` | Tests unitarios + integración |
| `npm run test:e2e` | Tests end-to-end |

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

O conecta tu repositorio directamente desde [vercel.com](https://vercel.com)

### Variables de entorno en Vercel

Agrega en Vercel Dashboard:
```
NEXT_PUBLIC_API_URL=https://tu-backend.render.com
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Docker

```bash
# Build
docker build -f infra/docker/frontend.Dockerfile -t dubsar-frontend .

# Run
docker run -p 3000:3000 dubsar-frontend
```

## 🎯 Performance

### Optimizaciones implementadas

- ✅ Server Components por defecto
- ✅ Image optimization con next/image
- ✅ Dynamic imports para code splitting
- ✅ Turbopack para builds rápidos
- ✅ Font optimization con next/font

### Lighthouse Score (Target)

```
Performance: 95+
Accessibility: 100
Best Practices: 95+
SEO: 100
```

## 🐛 Debugging

### En desarrollo

```bash
# Mostrar logs detallados
DEBUG=* npm run dev

# Analizar bundle
npm run build -- --profile
```

### Troubleshooting común

**Error: Cannot connect to backend**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health

# Verificar NEXT_PUBLIC_API_URL en .env.local
```

**Error: Hydration mismatch**
```bash
# Limpiar caché
rm -rf .next
npm run dev
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guía de estilo

- Usa TypeScript para todos los archivos
- Sigue las convenciones de Next.js App Router
- Componentes en PascalCase
- Hooks con prefijo `use`
- Mantén componentes pequeños y reutilizables

## 📄 Licencia

Este proyecto está bajo la licencia MIT - ver el archivo [LICENSE](../LICENSE) para más detalles.

## 👨‍💻 Autor

**Marko Teixido**
- GitHub: [@MarkoTeixido](https://github.com/MarkoTeixido)
- Portfolio: [Tu sitio web]
- Email: teixido_marko@outlook.es

## 🙏 Agradecimientos

- Next.js Team
- Shadcn UI
- Vercel
- Tailwind CSS

---

**Versión**: 2.0.0