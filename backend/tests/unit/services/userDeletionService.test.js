import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userDeletionService } from '../../../src/services/auth/userDeletionService.js';
import { supabase, supabaseAdmin } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('UserDeletionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserConversations', () => {
    it('debe retornar conversaciones del usuario', async () => {
      const mockConversations = [
        { id: 'conv-1' },
        { id: 'conv-2' },
        { id: 'conv-3' },
      ];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockConversations,
          error: null,
        }),
      });

      const result = await userDeletionService.getUserConversations('user-123');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('conv-1');
    });

    it('debe retornar array vacío si no hay conversaciones', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await userDeletionService.getUserConversations('user-123');

      expect(result).toEqual([]);
    });

    it('debe lanzar error si la consulta falla', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        }),
      });

      await expect(
        userDeletionService.getUserConversations('user-123')
      ).rejects.toThrow();
    });
  });

  describe('deleteConversationFiles', () => {
    it('debe eliminar archivos de una conversación', async () => {
      const mockFiles = [
        { name: 'file1.pdf' },
        { name: 'file2.png' },
      ];

      supabaseAdmin.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: mockFiles,
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          data: {},
          error: null,
        }),
      });

      await userDeletionService.deleteConversationFiles('conv-123');

      const storage = supabaseAdmin.storage.from();
      expect(storage.remove).toHaveBeenCalledWith([
        'conv-123/file1.pdf',
        'conv-123/file2.png',
      ]);
    });

    it('debe manejar conversación sin archivos', async () => {
        const mockStorage = {
            list: vi.fn().mockResolvedValue({
            data: [],
            error: null,
            }),
            remove: vi.fn(), // ⚡ Crear el mock de remove aunque no se use
        };

        supabaseAdmin.storage.from.mockReturnValue(mockStorage);

        await userDeletionService.deleteConversationFiles('conv-123');

        // Verificar que remove NO fue llamado
        expect(mockStorage.remove).not.toHaveBeenCalled();
    });

    it('debe continuar si list falla', async () => {
      supabaseAdmin.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage error' },
        }),
      });

      // No debería lanzar error
      await expect(
        userDeletionService.deleteConversationFiles('conv-123')
      ).resolves.toBeUndefined();
    });

    it('debe lanzar error si remove falla', async () => {
      const mockFiles = [{ name: 'file1.pdf' }];

      supabaseAdmin.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: mockFiles,
          error: null,
        }),
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Remove failed' },
        }),
      });

      await expect(
        userDeletionService.deleteConversationFiles('conv-123')
      ).rejects.toThrow();
    });
  });

  describe('deleteUserFiles', () => {
    it('debe eliminar archivos de todas las conversaciones', async () => {
      const mockConversations = [
        { id: 'conv-1' },
        { id: 'conv-2' },
      ];

      // Mock getUserConversations
      vi.spyOn(userDeletionService, 'getUserConversations').mockResolvedValue(
        mockConversations
      );

      // Mock deleteConversationFiles
      vi.spyOn(userDeletionService, 'deleteConversationFiles').mockResolvedValue();

      await userDeletionService.deleteUserFiles('user-123');

      expect(userDeletionService.deleteConversationFiles).toHaveBeenCalledTimes(2);
      expect(userDeletionService.deleteConversationFiles).toHaveBeenCalledWith('conv-1');
      expect(userDeletionService.deleteConversationFiles).toHaveBeenCalledWith('conv-2');
    });

    it('debe manejar usuario sin conversaciones', async () => {
      vi.spyOn(userDeletionService, 'getUserConversations').mockResolvedValue([]);
      vi.spyOn(userDeletionService, 'deleteConversationFiles').mockResolvedValue();

      await userDeletionService.deleteUserFiles('user-123');

      expect(userDeletionService.deleteConversationFiles).not.toHaveBeenCalled();
    });

    it('debe continuar si una conversación falla', async () => {
      const mockConversations = [
        { id: 'conv-1' },
        { id: 'conv-2' },
      ];

      vi.spyOn(userDeletionService, 'getUserConversations').mockResolvedValue(
        mockConversations
      );

      vi.spyOn(userDeletionService, 'deleteConversationFiles')
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce();

      await userDeletionService.deleteUserFiles('user-123');

      expect(userDeletionService.deleteConversationFiles).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteUserConversations', () => {
    it('debe eliminar conversaciones del usuario', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      await userDeletionService.deleteUserConversations('user-123');

      const conversations = supabase.from();
      expect(conversations.delete).toHaveBeenCalled();
      expect(conversations.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('debe lanzar error si la eliminación falla', async () => {
      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      });

      await expect(
        userDeletionService.deleteUserConversations('user-123')
      ).rejects.toThrow();
    });
  });

  describe('deleteAuthUser', () => {
    it('debe eliminar usuario de Auth', async () => {
      supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        data: {},
        error: null,
      });

      await userDeletionService.deleteAuthUser('user-123');

      expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith('user-123');
    });

    it('debe lanzar error si la eliminación falla', async () => {
      supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({
        data: null,
        error: { message: 'Delete user failed' },
      });

      await expect(
        userDeletionService.deleteAuthUser('user-123')
      ).rejects.toThrow();
    });
  });

  describe('deleteUserAccount', () => {
    it('debe eliminar cuenta completa exitosamente', async () => {
      // Mock todos los métodos
      vi.spyOn(userDeletionService, 'deleteUserFiles').mockResolvedValue();
      vi.spyOn(userDeletionService, 'deleteUserConversations').mockResolvedValue();
      vi.spyOn(userDeletionService, 'deleteAuthUser').mockResolvedValue();

      await userDeletionService.deleteUserAccount('user-123');

      expect(userDeletionService.deleteUserFiles).toHaveBeenCalledWith('user-123');
      expect(userDeletionService.deleteUserConversations).toHaveBeenCalledWith('user-123');
      expect(userDeletionService.deleteAuthUser).toHaveBeenCalledWith('user-123');
    });

    it('debe lanzar error si deleteUserFiles falla', async () => {
      vi.spyOn(userDeletionService, 'deleteUserFiles').mockRejectedValue(
        new Error('File deletion failed')
      );

      await expect(
        userDeletionService.deleteUserAccount('user-123')
      ).rejects.toThrow('Error al eliminar cuenta');
    });

    it('debe lanzar error si deleteUserConversations falla', async () => {
      vi.spyOn(userDeletionService, 'deleteUserFiles').mockResolvedValue();
      vi.spyOn(userDeletionService, 'deleteUserConversations').mockRejectedValue(
        new Error('Conversation deletion failed')
      );

      await expect(
        userDeletionService.deleteUserAccount('user-123')
      ).rejects.toThrow('Error al eliminar cuenta');
    });

    it('debe lanzar error si deleteAuthUser falla', async () => {
      vi.spyOn(userDeletionService, 'deleteUserFiles').mockResolvedValue();
      vi.spyOn(userDeletionService, 'deleteUserConversations').mockResolvedValue();
      vi.spyOn(userDeletionService, 'deleteAuthUser').mockRejectedValue(
        new Error('Auth deletion failed')
      );

      await expect(
        userDeletionService.deleteUserAccount('user-123')
      ).rejects.toThrow('Error al eliminar cuenta');
    });
  });
});