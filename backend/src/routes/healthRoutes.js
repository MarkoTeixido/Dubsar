// backend/src/routes/healthRoutes.js
import express from 'express';
import os from 'os';
import { metrics } from '../middlewares/metrics.js';

const router = express.Router();

/**
 * GET /health
 * Health check completo con métricas del sistema
 */
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const mem = process.memoryUsage();
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      cpus: os.cpus().length,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    services: {
      database: 'Supabase (PostgreSQL)',
      ai: 'Google Gemini AI',
      storage: 'Supabase Storage'
    },
    version: '2.0.0'
  });
});

/**
 * GET /metrics
 * Métricas de performance y uso
 */
router.get('/metrics', (req, res) => {
  const uptime = Date.now() - metrics.startTime;
  const mem = process.memoryUsage();
  
  // Calcular promedios por ruta
  const routeMetrics = Object.entries(metrics.requests).map(([route, data]) => ({
    route,
    requests: data.count,
    avgDuration: data.count > 0 ? `${(data.totalDuration / data.count).toFixed(2)}ms` : '0ms'
  }));
  
  const totalRequests = Object.values(metrics.requests).reduce((sum, r) => sum + r.count, 0);
  
  res.json({
    uptime: {
      milliseconds: uptime,
      formatted: formatUptime(uptime / 1000)
    },
    requests: {
      total: totalRequests,
      byRoute: routeMetrics
    },
    errors: {
      total: metrics.errors,
      rate: totalRequests > 0 
        ? `${((metrics.errors / totalRequests) * 100).toFixed(2)}%` 
        : '0%'
    },
    memory: {
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      external: `${(mem.external / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`
    },
    system: {
      loadAverage: os.loadavg(),
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      uptime: formatUptime(os.uptime())
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /ready
 * Readiness probe (para Kubernetes/Docker)
 */
router.get('/ready', (req, res) => {
  res.json({ 
    status: 'ready', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * GET /live
 * Liveness probe (para Kubernetes/Docker)
 */
router.get('/live', (req, res) => {
  res.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
});

// Helper para formatear tiempo
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  
  return parts.join(' ');
}

export default router;