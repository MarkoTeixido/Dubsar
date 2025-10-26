import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  authenticateUser,
  optionalAuth,
  requireRole,
  requireOwnership,
} from '../../../src/middlewares/authMiddleware.js';
import { authService } from '../../../src/services/auth/authService.js';

vi.mock('../../../src/services/auth/authService.js');

describe('AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
      params: {},
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('debe autenticar usuario con token válido', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      req.headers.authorization = 'Bearer valid-token';

      authService.extractToken.mockReturnValue('valid-token');
      authService.verifyToken.mockResolvedValue(mockUser);

      await authenticateUser(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar request sin token', async () => {
      req.headers.authorization = null;
      authService.extractToken.mockReturnValue(null);

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No autorizado',
        message: 'Token no proporcionado',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe rechazar token inválido', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      authService.extractToken.mockReturnValue('invalid-token');
      authService.verifyToken.mockRejectedValue(
        new Error('Token inválido o expirado')
      );

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido',
        message: 'Tu sesión ha expirado o el token es inválido',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe manejar errores del servidor', async () => {
      req.headers.authorization = 'Bearer token';

      authService.extractToken.mockReturnValue('token');
      authService.verifyToken.mockRejectedValue(new Error('Server error'));

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error del servidor',
        message: 'No se pudo verificar la autenticación',
      });
    });
  });

  describe('optionalAuth', () => {
    it('debe adjuntar usuario si token es válido', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      req.headers.authorization = 'Bearer valid-token';

      authService.extractToken.mockReturnValue('valid-token');
      authService.verifyTokenOptional.mockResolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('debe continuar con user null si no hay token', async () => {
      req.headers.authorization = null;
      authService.extractToken.mockReturnValue(null);

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });

    it('debe continuar con user null si token es inválido', async () => {
      req.headers.authorization = 'Bearer invalid';

      authService.extractToken.mockReturnValue('invalid');
      authService.verifyTokenOptional.mockRejectedValue(
        new Error('Invalid token')
      );

      await optionalAuth(req, res, next);

      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('debe permitir acceso con rol correcto', () => {
      req.user = { id: 'user-123', role: 'admin' };
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe denegar acceso con rol incorrecto', () => {
      req.user = { id: 'user-123', role: 'user' };
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado',
        message: 'No tienes permisos para realizar esta acción',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe usar rol "user" por defecto', () => {
      req.user = { id: 'user-123' }; // Sin rol
      const middleware = requireRole(['user']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe denegar acceso sin autenticación', () => {
      req.user = null;
      const middleware = requireRole(['admin']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No autorizado',
        message: 'Debes estar autenticado',
      });
    });

    it('debe permitir múltiples roles', () => {
      req.user = { id: 'user-123', role: 'moderator' };
      const middleware = requireRole(['admin', 'moderator']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireOwnership', () => {
    it('debe permitir acceso al dueño del recurso (params)', () => {
      req.user = { id: 'user-123' };
      req.params.userId = 'user-123';
      const middleware = requireOwnership('userId');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe permitir acceso al dueño del recurso (body)', () => {
      req.user = { id: 'user-123' };
      req.body.userId = 'user-123';
      const middleware = requireOwnership('userId');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe denegar acceso a otro usuario', () => {
      req.user = { id: 'user-123' };
      req.params.userId = 'user-456';
      const middleware = requireOwnership('userId');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado',
        message: 'No tienes permiso para acceder a este recurso',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe denegar acceso sin autenticación', () => {
      req.user = null;
      req.params.userId = 'user-123';
      const middleware = requireOwnership('userId');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});