/**
 * Logger Utility
 * Proporciona funciones de logging consistentes en toda la aplicación
 */

const LOG_LEVELS = {
  ERROR: '❌ ERROR',
  WARN: '⚠️ WARN',
  INFO: 'ℹ️ INFO',
  DEBUG: '🐛 DEBUG',
};

export const logger = {
  error: (message, ...args) => {
    console.error(`${LOG_LEVELS.ERROR} [${new Date().toISOString()}]`, message, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`${LOG_LEVELS.WARN} [${new Date().toISOString()}]`, message, ...args);
  },

  info: (message, ...args) => {
    console.log(`${LOG_LEVELS.INFO} [${new Date().toISOString()}]`, message, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${LOG_LEVELS.DEBUG} [${new Date().toISOString()}]`, message, ...args);
    }
  },
};