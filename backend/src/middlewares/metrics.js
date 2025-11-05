// Métricas simples en memoria
export const metrics = {
  requests: {},
  errors: 0,
  startTime: Date.now()
};

/**
 * Middleware para trackear métricas
 */
export const trackMetrics = (req, res, next) => {
  const route = req.route?.path || req.path;
  
  // Contar requests por ruta
  if (!metrics.requests[route]) {
    metrics.requests[route] = { count: 0, totalDuration: 0 };
  }
  metrics.requests[route].count++;
  
  // Medir duración
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.requests[route].totalDuration += duration;
    
    // Contar errores
    if (res.statusCode >= 400) {
      metrics.errors++;
    }
  });
  
  next();
};