import { 
  isValidEmail, 
  isValidPassword, 
  findMissingFields 
} from "../utils/validators.js";

/**
 * Middlewares de Validación de Request
 * Validan datos de entrada en las peticiones HTTP
 */

/**
 * Middleware para validar que los campos requeridos estén presentes
 * @param {string[]} requiredFields - Array de nombres de campos requeridos
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.post('/api/endpoint', validateRequiredFields(['name', 'email']), handler);
 */
export function validateRequiredFields(requiredFields) {
  return (req, res, next) => {
    const missingFields = findMissingFields(req.body, requiredFields);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Datos incompletos",
        message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    next();
  };
}

/**
 * Middleware para validar formato de email
 * 
 * @example
 * router.post('/auth/login', validateEmail, handler);
 */
export function validateEmail(req, res, next) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "Email requerido",
      message: "El campo email es obligatorio",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Email inválido",
      message: "El formato del email no es válido",
    });
  }

  next();
}

/**
 * Middleware para validar longitud mínima de contraseña
 * @param {number} minLength - Longitud mínima (por defecto 6)
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.post('/auth/register', validatePassword(8), handler);
 */
export function validatePassword(minLength = 6) {
  return (req, res, next) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: "Contraseña requerida",
        message: "El campo password es obligatorio",
      });
    }

    if (!isValidPassword(password, minLength)) {
      return res.status(400).json({
        error: "Contraseña débil",
        message: `La contraseña debe tener al menos ${minLength} caracteres`,
      });
    }

    next();
  };
}

/**
 * Middleware para validar que un campo sea un UUID válido
 * @param {string} fieldName - Nombre del campo a validar
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.get('/conversations/:id', validateUUID('id'), handler);
 */
export function validateUUID(fieldName = 'id') {
  return (req, res, next) => {
    const value = req.params[fieldName] || req.body[fieldName];

    if (!value) {
      return res.status(400).json({
        error: "Campo requerido",
        message: `El campo ${fieldName} es obligatorio`,
      });
    }

    // Validación simple de UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return res.status(400).json({
        error: "UUID inválido",
        message: `El campo ${fieldName} debe ser un UUID válido`,
      });
    }

    next();
  };
}

/**
 * Middleware para validar múltiples condiciones a la vez
 * @param {Object[]} validations - Array de objetos con validaciones
 * @returns {Function} Middleware de Express
 * 
 * @example
 * router.post('/api/endpoint', validateMultiple([
 *   { field: 'email', type: 'email' },
 *   { field: 'password', type: 'password', minLength: 8 }
 * ]), handler);
 */
export function validateMultiple(validations) {
  return (req, res, next) => {
    const errors = [];

    for (const validation of validations) {
      const { field, type, minLength } = validation;
      const value = req.body[field];

      if (!value) {
        errors.push(`${field} es requerido`);
        continue;
      }

      if (type === 'email' && !isValidEmail(value)) {
        errors.push(`${field} debe ser un email válido`);
      }

      if (type === 'password' && !isValidPassword(value, minLength)) {
        errors.push(`${field} debe tener al menos ${minLength || 6} caracteres`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: "Errores de validación",
        message: errors.join(", "),
        errors,
      });
    }

    next();
  };
}