/**
 * Utilidades de Validación
 * Funciones puras para validar datos
 */

/**
 * Valida que un email tenga formato válido
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que una contraseña cumpla con la longitud mínima
 */
export function isValidPassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return false;
  }

  return password.length >= minLength;
}

/**
 * Encuentra campos faltantes en un objeto
 */
export function findMissingFields(data, requiredFields) {
  const missingFields = [];

  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

/**
 * Valida que un string no esté vacío
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida que un valor sea un número positivo
 */
export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

/**
 * Valida que un valor sea un UUID válido
 */
export function isValidUUID(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Valida que una URL sea válida
 */
export function isValidURL(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida longitud de string (min y max)
 */
export function isValidStringLength(value, min, max) {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const length = value.length;
  return length >= min && length <= max;
}