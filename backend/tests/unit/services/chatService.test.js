import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatService } from '../../../src/services/chat/chatService.js';
import { conversationService } from '../../../src/services/integrations/supabaseService.js';
import { messageService } from '../../../src/services/chat/messageService.js';

vi.mock('../../../src/services/integrations/supabaseService.js');
vi.mock('../../../src/services/chat/messageService.js');

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAccess', () => {
    it('debe permitir acceso a usuario anónimo', async () => {
      const result = await chatService.validateAccess('conv-123', null);

      expect(result).toBe(true);
      expect(conversationService.verifyOwnership).not.toHaveBeenCalled();
    });

    it('debe permitir acceso al dueño de la conversación', async () => {
      conversationService.verifyOwnership.mockResolvedValue(true);

      const result = await chatService.validateAccess('conv-123', 'user-123');

      expect(result).toBe(true);
      expect(conversationService.verifyOwnership).toHaveBeenCalledWith(
        'conv-123',
        'user-123'
      );
    });

    it('debe rechazar acceso a usuario no dueño', async () => {
      conversationService.verifyOwnership.mockResolvedValue(false);

      await expect(
        chatService.validateAccess('conv-123', 'user-456')
      ).rejects.toThrow('No tienes permiso para usar esta conversación');
    });
  });

  describe('saveUserMessage', () => {
    it('debe guardar mensaje de usuario autenticado', async () => {
      messageService.saveUserMessage.mockResolvedValue();

      await chatService.saveUserMessage(
        'user-123',
        'conv-123',
        'Hola bot',
        null
      );

      expect(messageService.saveUserMessage).toHaveBeenCalledWith(
        'conv-123',
        'Hola bot',
        null
      );
    });

    it('debe guardar mensaje con archivo', async () => {
      const fileData = {
        url: 'https://storage.com/file.png',
        name: 'file.png',
        type: 'image/png',
        size: 1024,
      };

      messageService.saveUserMessage.mockResolvedValue();

      await chatService.saveUserMessage(
        'user-123',
        'conv-123',
        'Mira esta imagen',
        fileData
      );

      expect(messageService.saveUserMessage).toHaveBeenCalledWith(
        'conv-123',
        'Mira esta imagen',
        fileData
      );
    });

    it('no debe guardar mensaje de usuario anónimo', async () => {
      await chatService.saveUserMessage(null, 'conv-123', 'Hola', null);

      expect(messageService.saveUserMessage).not.toHaveBeenCalled();
    });
  });

  describe('getFormattedHistory', () => {
    it('debe retornar historial formateado para usuario autenticado', async () => {
      const mockHistory = [
        { sender: 'user', text: 'Hola' },
        { sender: 'bot', text: 'Hola, ¿cómo estás?' },
      ];

      const mockFormatted = [
        { role: 'user', parts: [{ text: 'Hola' }] },
        { role: 'model', parts: [{ text: 'Hola, ¿cómo estás?' }] },
      ];

      messageService.getHistory.mockResolvedValue(mockHistory);
      messageService.formatForGemini.mockResolvedValue(mockFormatted);

      const result = await chatService.getFormattedHistory(
        'user-123',
        'conv-123'
      );

      expect(result).toEqual(mockFormatted);
      expect(messageService.getHistory).toHaveBeenCalledWith('conv-123');
    });

    it('debe excluir último mensaje por defecto', async () => {
      const mockHistory = [
        { sender: 'user', text: 'Mensaje 1' },
        { sender: 'bot', text: 'Respuesta 1' },
        { sender: 'user', text: 'Mensaje 2' },
      ];

      messageService.getHistory.mockResolvedValue(mockHistory);
      messageService.formatForGemini.mockResolvedValue([]);

      await chatService.getFormattedHistory('user-123', 'conv-123', true);

      // Debe formatear solo los primeros 2 mensajes
      expect(messageService.formatForGemini).toHaveBeenCalledWith(
        mockHistory.slice(0, -1)
      );
    });

    it('debe incluir último mensaje si excludeLast es false', async () => {
      const mockHistory = [
        { sender: 'user', text: 'Mensaje 1' },
        { sender: 'bot', text: 'Respuesta 1' },
      ];

      messageService.getHistory.mockResolvedValue(mockHistory);
      messageService.formatForGemini.mockResolvedValue([]);

      await chatService.getFormattedHistory('user-123', 'conv-123', false);

      expect(messageService.formatForGemini).toHaveBeenCalledWith(mockHistory);
    });

    it('debe retornar array vacío para usuario anónimo', async () => {
      const result = await chatService.getFormattedHistory(null, 'conv-123');

      expect(result).toEqual([]);
      expect(messageService.getHistory).not.toHaveBeenCalled();
    });

    it('debe retornar array vacío si falla obtener historial', async () => {
      messageService.getHistory.mockRejectedValue(
        new Error('History not found')
      );

      const result = await chatService.getFormattedHistory(
        'user-123',
        'conv-123'
      );

      expect(result).toEqual([]);
    });
  });

  describe('saveBotResponse', () => {
    it('debe guardar respuesta del bot y actualizar timestamp', async () => {
      messageService.saveBotMessage.mockResolvedValue();
      conversationService.updateTimestamp.mockResolvedValue();

      await chatService.saveBotResponse(
        'user-123',
        'conv-123',
        'Respuesta del bot'
      );

      expect(messageService.saveBotMessage).toHaveBeenCalledWith(
        'conv-123',
        'Respuesta del bot'
      );
      expect(conversationService.updateTimestamp).toHaveBeenCalledWith(
        'conv-123'
      );
    });

    it('no debe guardar respuesta para usuario anónimo', async () => {
      await chatService.saveBotResponse(null, 'conv-123', 'Respuesta');

      expect(messageService.saveBotMessage).not.toHaveBeenCalled();
      expect(conversationService.updateTimestamp).not.toHaveBeenCalled();
    });
  });

  describe('getMessageCount', () => {
    it('debe retornar conteo de mensajes para usuario autenticado', async () => {
      messageService.countMessages.mockResolvedValue(15);

      const result = await chatService.getMessageCount('user-123', 'conv-123');

      expect(result).toBe(15);
      expect(messageService.countMessages).toHaveBeenCalledWith('conv-123');
    });

    it('debe retornar 0 para usuario anónimo', async () => {
      const result = await chatService.getMessageCount(null, 'conv-123');

      expect(result).toBe(0);
      expect(messageService.countMessages).not.toHaveBeenCalled();
    });
  });
});