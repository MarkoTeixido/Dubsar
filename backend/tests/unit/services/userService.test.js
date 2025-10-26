import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../../../src/services/auth/userService.js';
import { supabaseAdmin } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('debe retornar perfil completo del usuario', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://avatar.com/test.png',
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const profile = userService.getUserProfile(mockUser);

      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('test@example.com');
      expect(profile.fullName).toBe('Test User');
      expect(profile.avatar).toBe('https://avatar.com/test.png');
      expect(profile.createdAt).toBe('2024-01-01T00:00:00Z');
    });

    it('debe manejar usuario sin metadata', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {},
        created_at: '2024-01-01T00:00:00Z',
      };

      const profile = userService.getUserProfile(mockUser);

      expect(profile.fullName).toBeUndefined();
      expect(profile.avatar).toBeUndefined();
    });

    it('debe manejar usuario sin user_metadata', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      const profile = userService.getUserProfile(mockUser);

      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('test@example.com');
    });
  });

  describe('updateUserProfile', () => {
    it('debe actualizar fullName correctamente', async () => {
      const mockUpdatedUser = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Updated Name',
            avatar_url: 'old-avatar.png',
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const result = await userService.updateUserProfile('user-123', {
        fullName: 'Updated Name',
      });

      expect(result.fullName).toBe('Updated Name');
      expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        { user_metadata: { full_name: 'Updated Name' } }
      );
    });

    it('debe actualizar avatar correctamente', async () => {
      const mockUpdatedUser = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User',
            avatar_url: 'new-avatar.png',
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const result = await userService.updateUserProfile('user-123', {
        avatar: 'new-avatar.png',
      });

      expect(result.avatar).toBe('new-avatar.png');
    });

    it('debe actualizar ambos campos a la vez', async () => {
      const mockUpdatedUser = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'New Name',
            avatar_url: 'new-avatar.png',
          },
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: mockUpdatedUser,
        error: null,
      });

      const result = await userService.updateUserProfile('user-123', {
        fullName: 'New Name',
        avatar: 'new-avatar.png',
      });

      expect(result.fullName).toBe('New Name');
      expect(result.avatar).toBe('new-avatar.png');
      expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        {
          user_metadata: {
            full_name: 'New Name',
            avatar_url: 'new-avatar.png',
          },
        }
      );
    });

    it('debe lanzar error si la actualización falla', async () => {
      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(
        userService.updateUserProfile('user-123', { fullName: 'Test' })
      ).rejects.toThrow('Error al actualizar perfil: Update failed');
    });

    it('debe manejar updates vacíos', async () => {
      const mockUser = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {},
          created_at: '2024-01-01T00:00:00Z',
        },
      };

      supabaseAdmin.auth.admin.updateUserById.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userService.updateUserProfile('user-123', {});

      expect(supabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-123',
        { user_metadata: {} }
      );
    });
  });
});