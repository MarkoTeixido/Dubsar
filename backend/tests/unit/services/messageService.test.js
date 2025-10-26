import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messageService } from '../../../src/services/chat/messageService.js';
import { supabase } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');
vi.mock('node-fetch');

describe('MessageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveUserMessage', () => {
    it('debe guardar mensaje de usuario sin archivo', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      await messageService.saveUserMessage('conv-123', 'Hola bot');

      const messages = supabase.from();
      expect(messages.insert).toHaveBeenCalledWith({
        conversation_id: 'conv-123',
        sender: 'user',
        text: 'Hola bot',
      });
    });

    it('debe guardar mensaje con archivo', async () => {
      const fileData = {
        url: 'https://storage.com/file.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 2048,
      };

      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      await messageService.saveUserMessage('conv-123', 'Adjunto archivo', fileData);

      const messages = supabase.from();
      expect(messages.insert).toHaveBeenCalledWith({
        conversation_id: 'conv-123',
        sender: 'user',
        text: 'Adjunto archivo',
        file_url: 'https://storage.com/file.pdf',
        file_name: 'document.pdf',
        file_type: 'application/pdf',
        file_size: 2048,
      });
    });

    it('debe lanzar error si insert falla', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
      });

      await expect(
        messageService.saveUserMessage('conv-123', 'Test')
      ).rejects.toThrow();
    });
  });

  describe('saveBotMessage', () => {
    it('debe guardar mensaje del bot', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      await messageService.saveBotMessage('conv-123', 'Respuesta del bot');

      const messages = supabase.from();
      expect(messages.insert).toHaveBeenCalledWith({
        conversation_id: 'conv-123',
        sender: 'bot',
        text: 'Respuesta del bot',
      });
    });

    it('debe lanzar error si insert falla', async () => {
      supabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Failed' } }),
      });

      await expect(
        messageService.saveBotMessage('conv-123', 'Test')
      ).rejects.toThrow();
    });
  });

  describe('getHistory', () => {
    it('debe obtener historial de mensajes', async () => {
      const mockMessages = [
        { sender: 'user', text: 'Hola', created_at: '2024-01-01T00:00:00Z' },
        { sender: 'bot', text: 'Hola!', created_at: '2024-01-01T00:00:01Z' },
      ];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: mockMessages, error: null }),
      });

      const result = await messageService.getHistory('conv-123');

      expect(result).toEqual(mockMessages);
    });

    it('debe aplicar límite personalizado', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      await messageService.getHistory('conv-123', 100);

      const messages = supabase.from();
      expect(messages.limit).toHaveBeenCalledWith(100);
    });

    it('debe lanzar error si query falla', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ error: { message: 'Query failed' } }),
      });

      await expect(messageService.getHistory('conv-123')).rejects.toThrow();
    });
  });

  describe('formatForGemini', () => {
    it('debe formatear mensajes de texto', async () => {
      const messages = [
        { sender: 'user', text: 'Hola' },
        { sender: 'bot', text: 'Hola!' },
      ];

      const result = await messageService.formatForGemini(messages);

      expect(result).toEqual([
        { role: 'user', parts: [{ text: 'Hola' }] },
        { role: 'model', parts: [{ text: 'Hola!' }] },
      ]);
    });

    it('debe formatear imagen Base64', async () => {
      const messages = [
        {
          sender: 'user',
          text: 'Mira',
          file_url: 'data:image/png;base64,iVBORw0KGgo=',
          file_type: 'image/png',
        },
      ];

      const result = await messageService.formatForGemini(messages);

      expect(result[0].parts).toHaveLength(2);
      expect(result[0].parts[0]).toEqual({ text: 'Mira' });
      expect(result[0].parts[1]).toEqual({
        inlineData: {
          mimeType: 'image/png',
          data: 'iVBORw0KGgo=',
        },
      });
    });

    it('debe mencionar documentos adjuntos', async () => {
      const messages = [
        {
          sender: 'user',
          text: 'Documento',
          file_url: 'https://storage.com/doc.pdf',
          file_name: 'doc.pdf',
          file_type: 'application/pdf',
        },
      ];

      const result = await messageService.formatForGemini(messages);

      expect(result[0].parts).toHaveLength(2);
      expect(result[0].parts[1].text).toContain('documento: doc.pdf');
    });

    it('debe manejar mensajes sin texto', async () => {
      const messages = [{ sender: 'user', text: '' }];

      const result = await messageService.formatForGemini(messages);

      expect(result[0].parts).toEqual([]);
    });
  });

  describe('countMessages', () => {
    it('debe contar mensajes correctamente', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ count: 42, error: null }),
      });

      const result = await messageService.countMessages('conv-123');

      expect(result).toBe(42);
    });

    it('debe lanzar error si count falla', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Count failed' } }),
      });

      await expect(messageService.countMessages('conv-123')).rejects.toThrow();
    });
  });
});