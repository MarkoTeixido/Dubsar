import { authService } from "../services/auth/authService.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware de Autenticación
 * Protege rutas verificando tokens JWT de Supabase
 */

/**
 * Middleware para proteger rutas que requieren autenticación
 * Bloquea el acceso si no hay token o es inválido
 * Adjunta el usuario autenticado a req.user
 * 
 * @example
 * router.get('/profile', authenticateUser, profileController.getProfile);
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authService.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        error: "No autorizado",
        message: "Token no proporcionado",
      });
    }

    // Verificar token
    const user = await authService.verifyToken(token);

    // Adjuntar usuario autenticado a la request
    req.user = user;
    next();
  } catch (error) {
    logger.error("❌ Error en autenticación:", error);

    if (error.message === "Token inválido o expirado") {
      return res.status(401).json({
        error: "Token inválido",
        message: "Tu sesión ha expirado o el token es inválido",
      });
    }

    return res.status(500).json({
      error: "Error del servidor",
      message: "No se pudo verificar la autenticación",
    });
  }
}

/**
 * Middleware de autenticación opcional
 * Verifica token pero NO bloquea si no existe o es inválido
 * Útil para endpoints que pueden funcionar con o sin autenticación
 * 
 * Si hay token válido: req.user = usuario
 * Si no hay token o es inválido: req.user = null
 * 
 * @example
 * router.post('/chat/anonymous', optionalAuth, chatController.chat);
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authService.extractToken(authHeader);

    if (token) {
      req.user = await authService.verifyTokenOptional(token);
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    logger.warn("⚠️ Error en optionalAuth (continuando sin usuario):", error);
    req.user = null;
    next();
  }
}

/**
 * Middleware para verificar roles (extensible para futuro)
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.delete('/admin/users/:id', authenticateUser, requireRole(['admin']), handler);
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado",
        message: "Debes estar autenticado",
      });
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: "No tienes permisos para realizar esta acción",
      });
    }

    next();
  };
}

/**
 * Middleware para verificar que el usuario sea dueño del recurso
 * @param {string} paramName - Nombre del parámetro que contiene el userId
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.delete('/users/:userId/profile', authenticateUser, requireOwnership('userId'), handler);
 */
export function requireOwnership(paramName = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado",
        message: "Debes estar autenticado",
      });
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];

    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        error: "Acceso denegado",
        message: "No tienes permiso para acceder a este recurso",
      });
    }

    next();
  };
}