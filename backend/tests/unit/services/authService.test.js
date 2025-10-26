import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../../src/services/auth/authService.js';
import { supabase } from '../../../src/config/database.js';

// Mock de supabase ya está en setup.js
vi.mock('../../../src/config/database.js');

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('debe registrar un usuario correctamente', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.registerUser(
        'test@example.com',
        'password123',
        'Test User'
      );

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.fullName).toBe('Test User');
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
    });

    it('debe lanzar error si el registro falla', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      await expect(
        authService.registerUser('test@example.com', 'password123', 'Test User')
      ).rejects.toThrow('Error al registrar: Email already exists');
    });

    it('debe permitir registrar sin fullName', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.registerUser('test@example.com', 'password123');

      expect(result.user.fullName).toBeUndefined();
    });
  });

  describe('loginUser', () => {
    it('debe iniciar sesión correctamente', async () => {
      const mockData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User', avatar_url: 'avatar.png' },
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

      const result = await authService.loginUser('test@example.com', 'password123');

      expect(result.user.id).toBe('user-123');
      expect(result.user.email).toBe('test@example.com');
      expect(result.session.access_token).toBe('token-123');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('debe lanzar error con credenciales incorrectas', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      await expect(
        authService.loginUser('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow('Email o contraseña incorrectos');
    });
  });

  describe('logoutUser', () => {
    it('debe cerrar sesión con token', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null });

      await authService.logoutUser('token-123');

      expect(supabase.auth.signOut).toHaveBeenCalledWith('token-123');
    });

    it('debe manejar logout sin token', async () => {
      await authService.logoutUser(null);

      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
  });

  describe('refreshUserSession', () => {
    it('debe refrescar la sesión correctamente', async () => {
      const mockSession = {
        session: {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_at: 9999999999,
        },
      };

      supabase.auth.refreshSession.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await authService.refreshUserSession('refresh-token-123');

      expect(result.access_token).toBe('new-token');
      expect(result.refresh_token).toBe('new-refresh');
    });

    it('debe lanzar error sin refresh token', async () => {
      await expect(authService.refreshUserSession(null)).rejects.toThrow(
        'Se necesita un refresh token'
      );
    });

    it('debe lanzar error si refresh falla', async () => {
      supabase.auth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      await expect(authService.refreshUserSession('invalid')).rejects.toThrow(
        'No se pudo refrescar la sesión'
      );
    });
  });

  describe('extractToken', () => {
    it('debe extraer token del header Bearer', () => {
      const token = authService.extractToken('Bearer token-123');
      expect(token).toBe('token-123');
    });

    it('debe retornar null si no hay Bearer', () => {
      const token = authService.extractToken('token-123');
      expect(token).toBeNull();
    });

    it('debe retornar null si header es null', () => {
      const token = authService.extractToken(null);
      expect(token).toBeNull();
    });

    it('debe retornar null si header está vacío', () => {
      const token = authService.extractToken('');
      expect(token).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('debe verificar token válido', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.verifyToken('valid-token');

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('debe lanzar error con token inválido', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(authService.verifyToken('invalid-token')).rejects.toThrow(
        'Token inválido o expirado'
      );
    });

    it('debe lanzar error sin token', async () => {
      await expect(authService.verifyToken(null)).rejects.toThrow(
        'Token no proporcionado'
      );
    });
  });

  describe('verifyTokenOptional', () => {
    it('debe retornar usuario con token válido', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.verifyTokenOptional('valid-token');

      expect(result.id).toBe('user-123');
    });

    it('debe retornar null con token inválido', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid' },
      });

      const result = await authService.verifyTokenOptional('invalid-token');

      expect(result).toBeNull();
    });

    it('debe retornar null sin token', async () => {
      const result = await authService.verifyTokenOptional(null);

      expect(result).toBeNull();
    });
  });

  describe('initiateGoogleOAuth', () => {
    it('debe retornar URL de OAuth', async () => {
      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://google.com/oauth' },
        error: null,
      });

      const result = await authService.initiateGoogleOAuth();

      expect(result.url).toBe('https://google.com/oauth');
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('debe lanzar error si OAuth falla', async () => {
      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' },
      });

      await expect(authService.initiateGoogleOAuth()).rejects.toThrow(
        'Error OAuth: OAuth failed'
      );
    });
  });
});