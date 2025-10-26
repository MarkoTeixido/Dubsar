import { describe, it, expect, vi, beforeEach } from 'vitest';
import { conversationBusinessService } from '../../../src/services/conversation/conversationBusinessService.js';
import { conversationService } from '../../../src/services/integrations/supabaseService.js';
import { messageService } from '../../../src/services/chat/messageService.js';

vi.mock('../../../src/services/integrations/supabaseService.js');
vi.mock('../../../src/services/chat/messageService.js');

describe('ConversationBusinessService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createConversation', () => {
    it('debe crear conversación con título por defecto', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Nueva conversación',
      };

      conversationService.create.mockResolvedValue(mockConversation);

      const result = await conversationBusinessService.createConversation('user-123');

      expect(result).toEqual(mockConversation);
      expect(conversationService.create).toHaveBeenCalledWith(
        'user-123',
        'Nueva conversación'
      );
    });

    it('debe crear conversación con título personalizado', async () => {
      const mockConversation = {
        id: 'conv-123',
        user_id: 'user-123',
        title: 'Mi conversación',
      };

      conversationService.create.mockResolvedValue(mockConversation);

      const result = await conversationBusinessService.createConversation(
        'user-123',
        'Mi conversación'
      );

      expect(result.title).toBe('Mi conversación');
      expect(conversationService.create).toHaveBeenCalledWith(
        'user-123',
        'Mi conversación'
      );
    });
  });

  describe('getUserConversations', () => {
    it('debe obtener conversaciones del usuario', async () => {
      const mockConversations = [
        { id: 'conv-1', title: 'Conv 1' },
        { id: 'conv-2', title: 'Conv 2' },
      ];

      conversationService.getAllByUser.mockResolvedValue(mockConversations);

      const result = await conversationBusinessService.getUserConversations('user-123');

      expect(result).toEqual(mockConversations);
      expect(conversationService.getAllByUser).toHaveBeenCalledWith('user-123');
    });

    it('debe retornar array vacío si no hay conversaciones', async () => {
      conversationService.getAllByUser.mockResolvedValue([]);

      const result = await conversationBusinessService.getUserConversations('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('getConversationMessages', () => {
    it('debe obtener mensajes si el usuario es dueño', async () => {
      const mockMessages = [
        { sender: 'user', text: 'Hola' },
        { sender: 'bot', text: 'Hola!' },
      ];

      conversationService.verifyOwnership.mockResolvedValue(true);
      messageService.getHistory.mockResolvedValue(mockMessages);

      const result = await conversationBusinessService.getConversationMessages(
        'conv-123',
        'user-123'
      );

      expect(result).toEqual(mockMessages);
      expect(conversationService.verifyOwnership).toHaveBeenCalledWith(
        'conv-123',
        'user-123'
      );
      expect(messageService.getHistory).toHaveBeenCalledWith('conv-123');
    });

    it('debe rechazar acceso si no es dueño', async () => {
      conversationService.verifyOwnership.mockResolvedValue(false);

      await expect(
        conversationBusinessService.getConversationMessages('conv-123', 'user-456')
      ).rejects.toThrow('FORBIDDEN: No tienes permiso para ver esta conversación');

      expect(messageService.getHistory).not.toHaveBeenCalled();
    });

    it('debe manejar conversación sin mensajes', async () => {
      conversationService.verifyOwnership.mockResolvedValue(true);
      messageService.getHistory.mockResolvedValue([]);

      const result = await conversationBusinessService.getConversationMessages(
        'conv-123',
        'user-123'
      );

      expect(result).toEqual([]);
    });
  });

  describe('updateConversationTitle', () => {
    it('debe actualizar título correctamente', async () => {
      const mockUpdated = {
        id: 'conv-123',
        title: 'Nuevo título',
      };

      conversationService.updateTitle.mockResolvedValue(mockUpdated);

      const result = await conversationBusinessService.updateConversationTitle(
        'conv-123',
        'user-123',
        'Nuevo título'
      );

      expect(result).toEqual(mockUpdated);
      expect(conversationService.updateTitle).toHaveBeenCalledWith(
        'conv-123',
        'user-123',
        'Nuevo título'
      );
    });

    it('debe rechazar título vacío', async () => {
      await expect(
        conversationBusinessService.updateConversationTitle(
          'conv-123',
          'user-123',
          ''
        )
      ).rejects.toThrow('VALIDATION: El título no puede estar vacío');

      expect(conversationService.updateTitle).not.toHaveBeenCalled();
    });

    it('debe rechazar título solo con espacios', async () => {
      await expect(
        conversationBusinessService.updateConversationTitle(
          'conv-123',
          'user-123',
          '   '
        )
      ).rejects.toThrow('VALIDATION: El título no puede estar vacío');
    });

    it('debe rechazar título null', async () => {
      await expect(
        conversationBusinessService.updateConversationTitle(
          'conv-123',
          'user-123',
          null
        )
      ).rejects.toThrow('VALIDATION: El título no puede estar vacío');
    });
  });

  describe('deleteConversation', () => {
    it('debe eliminar conversación correctamente', async () => {
      conversationService.delete.mockResolvedValue();

      await conversationBusinessService.deleteConversation('conv-123', 'user-123');

      expect(conversationService.delete).toHaveBeenCalledWith(
        'conv-123',
        'user-123'
      );
    });

    it('debe propagar error si delete falla', async () => {
      conversationService.delete.mockRejectedValue(
        new Error('Delete failed')
      );

      await expect(
        conversationBusinessService.deleteConversation('conv-123', 'user-123')
      ).rejects.toThrow('Delete failed');
    });
  });
});