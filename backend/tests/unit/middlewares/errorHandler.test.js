import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from '../../../src/middlewares/errorHandler.js';

describe('ErrorHandler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('debe manejar ValidationError', () => {
      const error = new ValidationError('Invalid data', { field: 'email' });

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos inválidos',
        message: 'Invalid data',
        details: { field: 'email' },
      });
    });

    it('debe manejar AuthenticationError', () => {
      const error = new AuthenticationError('Invalid credentials');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No autorizado',
        message: 'Invalid credentials',
      });
    });

    it('debe manejar AuthorizationError', () => {
      const error = new AuthorizationError('Access denied');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado',
        message: 'Access denied',
      });
    });

    it('debe manejar NotFoundError', () => {
      const error = new NotFoundError('Resource not found');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Recurso no encontrado',
        message: 'Resource not found',
      });
    });

    it('debe manejar DatabaseError con código', () => {
      const error = new DatabaseError('Query failed', 'PGRST116');
      error.code = 'PGRST116';

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de base de datos',
        message: 'Query failed',
        code: 'PGRST116',
      });
    });

    it('debe manejar errores genéricos con status code', () => {
      const error = new Error('Something went wrong');
      error.status = 418;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(418);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'Something went wrong',
      });
    });

    it('debe manejar errores sin status (500)', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error',
        message: 'Unexpected error',
      });
    });

    it('debe incluir stack trace en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Dev error');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('no debe incluir stack trace en producción', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Prod error');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('debe manejar errores de Supabase con código', () => {
      const error = {
        code: 'PGRST116',
        message: 'No rows found',
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de base de datos',
        message: 'No rows found',
        code: 'PGRST116',
      });
    });
  });

  describe('notFoundHandler', () => {
    it('debe retornar 404 para ruta no encontrada', () => {
      req.method = 'POST';
      req.path = '/api/nonexistent';

      notFoundHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Ruta no encontrada',
        message: 'La ruta POST /api/nonexistent no existe',
        suggestion: 'Verifica que la URL y el método HTTP sean correctos',
      });
    });

    it('debe manejar diferentes métodos HTTP', () => {
      req.method = 'DELETE';
      req.path = '/users/123';

      notFoundHandler(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'La ruta DELETE /users/123 no existe',
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('debe ejecutar función async exitosa', async () => {
      const asyncFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe capturar errores y pasarlos a next', async () => {
      const error = new Error('Async error');
      const asyncFn = vi.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(asyncFn).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });

    it('debe manejar funciones que retornan promesas', async () => {
      const asyncFn = async (req, res) => {
        res.json({ success: true });
      };
      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Custom Error Classes', () => {
    it('ValidationError debe tener nombre y detalles correctos', () => {
      const error = new ValidationError('Invalid', { field: 'email' });

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid');
      expect(error.details).toEqual({ field: 'email' });
    });

    it('AuthenticationError debe tener mensaje por defecto', () => {
      const error = new AuthenticationError();

      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Credenciales inválidas');
    });

    it('AuthorizationError debe tener mensaje por defecto', () => {
      const error = new AuthorizationError();

      expect(error.name).toBe('AuthorizationError');
      expect(error.message).toBe('No tienes permisos para realizar esta acción');
    });

    it('NotFoundError debe tener mensaje por defecto', () => {
      const error = new NotFoundError();

      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Recurso no encontrado');
    });

    it('DatabaseError debe incluir código', () => {
      const error = new DatabaseError('DB error', 'ERR123');

      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('DB error');
      expect(error.code).toBe('ERR123');
    });
  });
});