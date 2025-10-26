import { logger } from "../utils/logger.js";

/**
 * Middleware Centralizado de Manejo de Errores
 * Captura todos los errores y los formatea de manera consistente
 */

/**
 * Tipos de errores comunes
 */
const ERROR_TYPES = {
  VALIDATION: "ValidationError",
  DATABASE: "DatabaseError",
  AUTHENTICATION: "AuthenticationError",
  AUTHORIZATION: "AuthorizationError",
  NOT_FOUND: "NotFoundError",
};

/**
 * Middleware principal de manejo de errores
 * Debe ser el ÚLTIMO middleware en la cadena
 */
export function errorHandler(err, req, res, next) {
  // Log del error
  logger.error("❌ Error capturado:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Error de validación
  if (err.name === ERROR_TYPES.VALIDATION) {
    return res.status(400).json({
      error: "Datos inválidos",
      message: err.message,
      details: err.details || null,
    });
  }

  // Error de autenticación
  if (err.name === ERROR_TYPES.AUTHENTICATION) {
    return res.status(401).json({
      error: "No autorizado",
      message: err.message || "Credenciales inválidas",
    });
  }

  // Error de autorización
  if (err.name === ERROR_TYPES.AUTHORIZATION) {
    return res.status(403).json({
      error: "Acceso denegado",
      message: err.message || "No tienes permisos para realizar esta acción",
    });
  }

  // Error de recurso no encontrado
  if (err.name === ERROR_TYPES.NOT_FOUND) {
    return res.status(404).json({
      error: "Recurso no encontrado",
      message: err.message,
    });
  }

  // Error de Supabase
  if (err.code && err.message && typeof err.code === 'string') {
    return res.status(500).json({
      error: "Error de base de datos",
      message: err.message,
      code: err.code,
    });
  }

  // Error genérico
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    error: err.name || "Error del servidor",
    message: err.message || "Ha ocurrido un error inesperado",
  };

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Middleware para rutas no encontradas (404)
 * Debe ir ANTES del errorHandler
 */
export function notFoundHandler(req, res) {
  logger.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.path}`);
  
  res.status(404).json({
    error: "Ruta no encontrada",
    message: `La ruta ${req.method} ${req.path} no existe`,
    suggestion: "Verifica que la URL y el método HTTP sean correctos",
  });
}

/**
 * Middleware para errores asíncronos
 * Wrapper para rutas async/await que evita try-catch
 * 
 * @param {Function} fn - Función async del controller
 * @returns {Function} Middleware de Express con manejo de errores
 * 
 * @example
 * router.get('/users', asyncHandler(userController.getAll));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Clases de error personalizadas para uso en la aplicación
 */
export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = ERROR_TYPES.VALIDATION;
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Credenciales inválidas") {
    super(message);
    this.name = ERROR_TYPES.AUTHENTICATION;
  }
}

export class AuthorizationError extends Error {
  constructor(message = "No tienes permisos para realizar esta acción") {
    super(message);
    this.name = ERROR_TYPES.AUTHORIZATION;
  }
}

export class NotFoundError extends Error {
  constructor(message = "Recurso no encontrado") {
    super(message);
    this.name = ERROR_TYPES.NOT_FOUND;
  }
}

export class DatabaseError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = ERROR_TYPES.DATABASE;
    this.code = code;
  }
}