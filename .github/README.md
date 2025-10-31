<p align="center">
  <a href="https://dubsarai.vercel.app/"><img src="https://i.imgur.com/npJju1C.png" height="128"></a>
  <h2 align="center"><a href="https://dubsarai.vercel.app/">Dubsar AI - GitHub Workflows</a></h2>
  <p align="center">Automatización CI/CD con GitHub Actions para desarrollo y deployment<p>
  <p align="center">
    <a href="#-workflows">
    	<img src="https://img.shields.io/badge/%E2%9A%99%EF%B8%8F-Workflows-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="workflows" />
    </a>
    <a href="#-pipeline-cicd">
    	<img src="https://img.shields.io/badge/%F0%9F%9A%80-Pipeline-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="pipeline" />
    </a>
    <a href="#-health-checks">
    	<img src="https://img.shields.io/badge/%F0%9F%8F%A5-Health-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="health" />
    </a>
    <a href="#-secrets">
    	<img src="https://img.shields.io/badge/%F0%9F%94%90-Secrets-0a0a0a.svg?style=flat&colorA=0a0a0a" alt="secrets" />
    </a>
  </p>
</p>

<br>

![](https://i.imgur.com/waxVImv.png)

## 📁 Estructura

![](https://i.imgur.com/Pm2wJlt.png)


![](https://i.imgur.com/waxVImv.png)

## ⚙️ Workflows

### 🔄 Pipeline CI/CD Principal (`main.yml`)

Pipeline completo que ejecuta CI y CD para frontend y backend.

**Triggers:**
- Push a `main` o `develop`
- Pull requests a `main`
- Ejecución manual (`workflow_dispatch`)

**Jobs del Backend:**

| Job | Descripción | Duración Aprox. |
|-----|-------------|-----------------|
| `backend-test` | Tests unitarios + integración + cobertura | ~2-3 min |
| `backend-docker` | Build de imagen Docker | ~1-2 min |
| `backend-deploy` | Deploy a Render (solo en `main`) | ~30 seg |

**Jobs del Frontend:**

| Job | Descripción | Duración Aprox. |
|-----|-------------|-----------------|
| `frontend-test` | Tests unitarios + integración + cobertura | ~2-3 min |
| `frontend-lint` | ESLint y validación de código | ~30 seg |
| `frontend-build` | Build de Next.js | ~1-2 min |
| `frontend-docker` | Build de imagen Docker | ~1-2 min |
| `frontend-deploy` | Deploy a Vercel (solo en `main`) | ~1 min |

**Flujo de Ejecución:**

![](https://i.imgur.com/Xijfe6I.png)

### 🏥 Health Check (`health-check.yml`)

Monitoreo automático del estado del backend en producción.

**Triggers:**
- Cada hora (`cron: 0 * * * *`)
- Ejecución manual

**Verificaciones:**

1. **Health Check** (`/health` endpoint)
   - Valida HTTP 200
   - Verifica estado del servicio
   - Muestra uptime y memoria

2. **Metrics Check** (`/metrics` endpoint)
   - Total de requests
   - Error rate
   - Estadísticas de uso

3. **Alertas**
   - Falla si el backend no responde
   - Genera error visible en GitHub Actions

**Ejemplo de Output:**

```bash
✅ Backend is healthy

📊 Summary:
  Status: healthy
  Uptime: 5d 3h 22m
  Memory: 145.2 MB

📈 Fetching metrics...
📊 Metrics Summary:
  Total Requests: 15,432
  Error Rate: 0.02%
```

### 🔧 CI Backend (`CI/ci-backend.yml`)

Workflow dedicado para integración continua del backend.

**Pasos:**
1. Checkout del código
2. Setup Node.js 22.x
3. Instalación de dependencias (`npm ci`)
4. Tests unitarios
5. Tests de integración
6. Reporte de cobertura

### 🎨 CI Frontend (`CI/ci-frontend.yml`)

Workflow dedicado para integración continua del frontend.

**Pasos:**
1. Checkout del código
2. Setup Node.js 22.x
3. Instalación de dependencias (`npm ci`)
4. ESLint
5. Tests unitarios
6. Tests de integración
7. Build de Next.js
8. Reporte de cobertura

### 🚀 CD Backend (`CD/cd-backend.yml`)

Deployment automático del backend a Render.

**Trigger:** Solo en push a `main` después de pasar CI

**Proceso:**
- Trigger del deploy hook de Render
- Deploy automático del backend

### 🎯 CD Frontend (`CD/cd-frontend.yml`)

Deployment automático del frontend a Vercel.

**Trigger:** Solo en push a `main` después de pasar CI

**Proceso:**
- Instalación de Vercel CLI
- Deploy a producción con `--prod` flag

![](https://i.imgur.com/waxVImv.png)

## 🔐 Secrets

Variables secretas requeridas en GitHub Settings → Secrets and Variables → Actions:

### Backend Secrets

| Secret | Descripción | Usado en |
|--------|-------------|----------|
| `GOOGLE_API_KEY` | API Key de Google Gemini | CI tests |
| `SUPABASE_URL` | URL del proyecto Supabase | CI tests |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase | CI tests |
| `SUPABASE_ANON_KEY` | Anon key de Supabase | CI tests |
| `RENDER_DEPLOY_HOOK` | Webhook de deploy de Render | CD deploy |
| `BACKEND_URL` | URL del backend en producción | Health check |

### Frontend Secrets

| Secret | Descripción | Usado en |
|--------|-------------|----------|
| `VERCEL_TOKEN` | Token de autenticación de Vercel | CD deploy |
| `VERCEL_ORG_ID` | ID de organización en Vercel | CD deploy |
| `VERCEL_PROJECT_ID` | ID del proyecto en Vercel | CD deploy |

![](https://i.imgur.com/GzvsRv5.png)

### Cómo Configurar Secrets

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"
4. Agrega cada secret con su valor correspondiente

![](https://i.imgur.com/waxVImv.png)

## 🐛 Troubleshooting

### El workflow falla en tests

```bash
# Verificar localmente
cd backend  # o frontend
npm test

# Revisar logs en GitHub Actions
# Settings → Actions → Failed workflow → View logs
```

### Deploy a Render falla

```bash
# Verificar que el deploy hook esté configurado
echo $RENDER_DEPLOY_HOOK

# Verificar manualmente
curl -X POST "$RENDER_DEPLOY_HOOK"
```

### Deploy a Vercel falla

```bash
# Verificar tokens
vercel whoami --token=$VERCEL_TOKEN

# Deploy manual
cd frontend
vercel --prod --token=$VERCEL_TOKEN
```

### Health check falla

```bash
# Verificar que el backend esté corriendo
curl https://tu-backend-url.onrender.com/health

# Verificar el secret BACKEND_URL en GitHub
```

![](https://i.imgur.com/waxVImv.png)

## 📈 Métricas

### Tiempos de Ejecución Promedio

```
Pipeline completo:     ~8-12 min
  ├─ Backend CI:       ~3-4 min
  ├─ Backend Docker:   ~1-2 min
  ├─ Frontend CI:      ~3-4 min
  ├─ Frontend Docker:  ~1-2 min
  ├─ Backend Deploy:   ~30 seg
  └─ Frontend Deploy:  ~1 min

Health Check:          ~30 seg
```

### Frecuencia de Deployments

```
Promedio:              3-5 deploys/semana
Health Checks:         24 veces/día (cada hora)
```

![](https://i.imgur.com/waxVImv.png)

## 📝 Scripts Útiles

### Ejecutar workflow manualmente

```bash
# Desde GitHub CLI
gh workflow run main.yml

# Health check manual
gh workflow run health-check.yml
```

### Ver status de workflows

```bash
# Listar todos los workflows
gh workflow list

# Ver runs recientes
gh run list --workflow=main.yml

# Ver logs de último run
gh run view --log
```

![](https://i.imgur.com/waxVImv.png)

---

<div align="center">

Hecho por [Marko Teixido](https://github.com/MarkoTeixido)

</div>