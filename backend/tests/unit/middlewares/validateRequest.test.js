import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateUUID,
  validateMultiple,
} from '../../../src/middlewares/validateRequest.js';

describe('ValidateRequest Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('validateRequiredFields', () => {
    it('debe pasar si todos los campos están presentes', () => {
      req.body = { name: 'John', email: 'john@test.com' };
      const middleware = validateRequiredFields(['name', 'email']);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar si falta un campo', () => {
      req.body = { name: 'John' };
      const middleware = validateRequiredFields(['name', 'email']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Datos incompletos',
        message: 'Faltan los siguientes campos: email',
        missingFields: ['email'],
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('debe rechazar si faltan múltiples campos', () => {
      req.body = {};
      const middleware = validateRequiredFields(['name', 'email', 'password']);

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          missingFields: ['name', 'email', 'password'],
        })
      );
    });

    it('debe ignorar campos vacíos string', () => {
      req.body = { name: '', email: 'test@test.com' };
      const middleware = validateRequiredFields(['name', 'email']);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateEmail', () => {
    it('debe pasar con email válido', () => {
      req.body.email = 'test@example.com';

      validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('debe rechazar email sin @', () => {
      req.body.email = 'testexample.com';

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email inválido',
        message: 'El formato del email no es válido',
      });
    });

    it('debe rechazar email sin dominio', () => {
      req.body.email = 'test@';

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debe rechazar si no hay email', () => {
      req.body = {};

      validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email requerido',
        message: 'El campo email es obligatorio',
      });
    });
  });

  describe('validatePassword', () => {
    it('debe pasar con contraseña válida (default 6 caracteres)', () => {
      req.body.password = 'pass123';
      const middleware = validatePassword();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe pasar con contraseña de longitud custom', () => {
      req.body.password = 'password123';
      const middleware = validatePassword(8);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe rechazar contraseña corta', () => {
      req.body.password = '123';
      const middleware = validatePassword(6);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contraseña débil',
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    });

    it('debe rechazar si no hay contraseña', () => {
      req.body = {};
      const middleware = validatePassword();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Contraseña requerida',
        message: 'El campo password es obligatorio',
      });
    });
  });

  describe('validateUUID', () => {
    it('debe pasar con UUID válido en params', () => {
      req.params.id = '123e4567-e89b-12d3-a456-426614174000';
      const middleware = validateUUID('id');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe pasar con UUID válido en body', () => {
      req.body.userId = '123e4567-e89b-12d3-a456-426614174000';
      const middleware = validateUUID('userId');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe rechazar UUID inválido', () => {
      req.params.id = 'not-a-uuid';
      const middleware = validateUUID('id');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'UUID inválido',
        message: 'El campo id debe ser un UUID válido',
      });
    });

    it('debe rechazar si UUID no está presente', () => {
      req.params = {};
      req.body = {};
      const middleware = validateUUID('id');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Campo requerido',
        message: 'El campo id es obligatorio',
      });
    });
  });

  describe('validateMultiple', () => {
    it('debe pasar con todas las validaciones correctas', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validateMultiple([
        { field: 'email', type: 'email' },
        { field: 'password', type: 'password', minLength: 8 },
      ]);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe rechazar con email inválido', () => {
      req.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      const middleware = validateMultiple([
        { field: 'email', type: 'email' },
        { field: 'password', type: 'password' },
      ]);

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['email debe ser un email válido']),
        })
      );
    });

    it('debe rechazar con contraseña corta', () => {
      req.body = {
        email: 'test@example.com',
        password: '123',
      };

      const middleware = validateMultiple([
        { field: 'email', type: 'email' },
        { field: 'password', type: 'password', minLength: 8 },
      ]);

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            'password debe tener al menos 8 caracteres',
          ]),
        })
      );
    });

    it('debe rechazar con múltiples errores', () => {
      req.body = {
        email: 'invalid',
        password: '123',
      };

      const middleware = validateMultiple([
        { field: 'email', type: 'email' },
        { field: 'password', type: 'password', minLength: 8 },
      ]);

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            'email debe ser un email válido',
            'password debe tener al menos 8 caracteres',
          ]),
        })
      );
    });

    it('debe rechazar campos faltantes', () => {
      req.body = {};

      const middleware = validateMultiple([
        { field: 'email', type: 'email' },
      ]);

      middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['email es requerido']),
        })
      );
    });
  });
});