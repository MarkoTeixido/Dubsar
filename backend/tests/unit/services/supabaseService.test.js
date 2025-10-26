import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversationService } from '../../../src/services/integrations/supabaseService.js';
import { supabase } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('SupabaseService - ConversationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear conversación con título por defecto', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Nueva conversación',
      };

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockConversation,
          error: null,
        }),
      });

      const result = await conversationService.create('user-123');

      expect(result).toEqual(mockConversation);
    });

    it('debe crear conversación con título personalizado', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'conv-123', title: 'Mi Chat' },
          error: null,
        }),
      });

      const result = await conversationService.create('user-123', 'Mi Chat');

      expect(result.title).toBe('Mi Chat');
    });

    it('debe lanzar error si insert falla', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insert failed' },
        }),
      });

      await expect(conversationService.create('user-123')).rejects.toThrow();
    });
  });

  describe('getAllByUser', () => {
    it('debe obtener conversaciones ordenadas por fecha', async () => {
      const mockConversations = [
        { id: 'conv-2', title: 'Reciente', updated_at: '2024-01-02' },
        { id: 'conv-1', title: 'Antigua', updated_at: '2024-01-01' },
      ];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockConversations,
          error: null,
        }),
      });

      const result = await conversationService.getAllByUser('user-123');

      expect(result).toEqual(mockConversations);
    });

    it('debe retornar array vacío si no hay conversaciones', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await conversationService.getAllByUser('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('updateTitle', () => {
    it('debe actualizar título correctamente', async () => {
      const mockUpdated = {
        id: 'conv-123',
        title: 'Nuevo título',
      };

      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUpdated,
          error: null,
        }),
      });

      const result = await conversationService.updateTitle(
        'conv-123',
        'user-123',
        'Nuevo título'
      );

      expect(result.title).toBe('Nuevo título');
    });
  });

  describe('delete', () => {
    it('debe eliminar conversación', async () => {
        supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(), // ⚡ Primer .eq() retornaThis
        // ⚡ El segundo .eq() ya está cubierto por mockReturnThis()
        });

        // Mock para que el último .eq() retorne el resultado
        const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        };

        // Configurar para que el segundo eq retorne el resultado
        mockChain.eq = vi.fn()
        .mockReturnValueOnce(mockChain) // Primer eq retorna chain
        .mockResolvedValueOnce({ error: null }); // Segundo eq retorna resultado

        supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(mockChain),
        });

        await conversationService.delete('conv-123', 'user-123');

        expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('debe lanzar error si delete falla', async () => {
        const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        };

        mockChain.eq = vi.fn()
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ error: { message: 'Delete failed' } });

        supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(mockChain),
        });

        await expect(
        conversationService.delete('conv-123', 'user-123')
        ).rejects.toThrow();
    });
  });

  describe('verifyOwnership', () => {
    it('debe retornar true si es dueño', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'conv-123' },
          error: null,
        }),
      });

      const result = await conversationService.verifyOwnership(
        'conv-123',
        'user-123'
      );

      expect(result).toBe(true);
    });

    it('debe retornar false si no es dueño', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const result = await conversationService.verifyOwnership(
        'conv-123',
        'user-456'
      );

      expect(result).toBe(false);
    });
  });
});