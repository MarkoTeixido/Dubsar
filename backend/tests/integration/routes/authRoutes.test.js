import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import { supabase, supabaseAdmin } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');
vi.mock('../../../src/config/gemini.js');

describe('Integration: Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('debe registrar usuario correctamente', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('debe validar email requerido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('debe validar formato de email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('debe validar contraseña mínima 6 caracteres', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
    });

    it('debe manejar error de email duplicado', async () => {
        supabase.auth.signUp.mockResolvedValue({
            data: null,
            error: { message: 'Email already exists' },
        });

        const response = await request(app)
            .post('/auth/register')
            .send({
            email: 'existing@example.com',
            password: 'password123',
            });

        expect(response.status).toBe(400); // ⚡ CAMBIO: de 500 a 400
        expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /auth/login', () => {
    it('debe hacer login correctamente', async () => {
      const mockData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-123',
          expires_at: 1234567890,
        },
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.session.access_token).toBe('token-123');
    });

    it('debe rechazar credenciales incorrectas', async () => {
        supabase.auth.signInWithPassword.mockResolvedValue({
            data: null,
            error: { message: 'Invalid credentials' },
        });

        const response = await request(app)
            .post('/auth/login')
            .send({
            email: 'wrong@example.com',
            password: 'wrongpassword',
            });

        expect(response.status).toBe(401); 
        expect(response.body.error).toBeTruthy();
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('debe hacer logout con token', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer token-123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe permitir logout sin token', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /auth/me', () => {
    it('debe obtener perfil autenticado', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z',
      };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('debe rechazar sin token', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('debe rechazar token inválido', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /auth/profile', () => {
    it('debe actualizar fullName', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      });

      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { full_name: 'Updated Name' },
          },
        },
        error: null,
      });

      const response = await request(app)
        .patch('/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({
          fullName: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.fullName).toBe('Updated Name');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .patch('/auth/profile')
        .send({
          fullName: 'Test',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('debe refrescar token', async () => {
        supabase.auth.refreshSession.mockResolvedValue({
        data: {
            session: {
            access_token: 'new-token',
            refresh_token: 'new-refresh',
            expires_at: 9999999999,
            },
        },
        error: null,
        });

        const response = await request(app)
        .post('/auth/refresh')
        .send({
            refresh_token: 'old-refresh', // ⚡ CAMBIO: underscore
        });

        expect(response.status).toBe(200);
        expect(response.body.session.access_token).toBe('new-token');
    });

    it('debe rechazar sin refreshToken', async () => {
        const response = await request(app)
        .post('/auth/refresh')
        .send({});

        expect(response.status).toBe(400);
    });

    it('debe rechazar sin refreshToken', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /auth/account', () => {
    it('debe eliminar cuenta autenticada', async () => {
        // Mock getUser
        supabase.auth.getUser.mockResolvedValue({
        data: {
            user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
        });

        // Mock getUserConversations (para userDeletionService)
        supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
            data: [], // Sin conversaciones para simplificar
            error: null,
        }),
        });

        // Mock deleteUserConversations
        const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        };

        mockChain.eq = vi.fn()
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ error: null });

        supabase.from.mockReturnValueOnce({
        delete: vi.fn().mockReturnValue(mockChain),
        });

        // Mock deleteAuthUser
        supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        data: {},
        error: null,
        });

        const response = await request(app)
        .delete('/auth/account')
        .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('debe rechazar sin autenticación', async () => {
        const response = await request(app).delete('/auth/account');

        expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/oauth/google', () => {
    it('debe retornar URL de OAuth', async () => {
      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth?client_id=123' },
        error: null,
      });

      const response = await request(app).get('/auth/oauth/google');

      expect(response.status).toBe(200);
      expect(response.body.url).toContain('google.com');
    });
  });
});