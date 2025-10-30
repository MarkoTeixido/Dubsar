import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '../../../src/services/integrations/geminiService.js';
import { geminiClient } from '../../../src/config/gemini.js';

// ✅ Mock completo con getModelWithInstructions
vi.mock('../../../src/config/gemini.js', () => ({
  geminiClient: {
    getGenerativeModel: vi.fn(),
  },
  GEMINI_MODEL: 'gemini-test',
  GEMINI_CONFIG: { maxOutputTokens: 2048, temperature: 0.7 },
  getModelWithInstructions: vi.fn(), // ← ESTO FALTABA
}));

describe('GeminiService', () => {
  let mockChat;
  let mockModel;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockChat = {
      sendMessage: vi.fn(),
      sendMessageStream: vi.fn(),
    };

    mockModel = {
      startChat: vi.fn(() => mockChat),
    };

    // ✅ Importar dinámicamente para obtener el mock
    const { getModelWithInstructions } = await import('../../../src/config/gemini.js');
    getModelWithInstructions.mockReturnValue(mockModel);
    
    geminiClient.getGenerativeModel.mockReturnValue(mockModel);
  });

  describe('generateResponse', () => {
    it('debe generar respuesta sin streaming', async () => {
      mockChat.sendMessage.mockResolvedValue({
        response: {
          text: () => 'Respuesta de Gemini',
        },
      });

      const result = await geminiService.generateResponse('Hola', []);

      expect(result).toBe('Respuesta de Gemini');
      expect(mockModel.startChat).toHaveBeenCalledWith({
        history: [],
        generationConfig: expect.any(Object),
      });
    });

    it('debe pasar historial correctamente', async () => {
      const history = [
        { role: 'user', parts: [{ text: 'Hola' }] },
        { role: 'model', parts: [{ text: 'Hola!' }] },
      ];

      mockChat.sendMessage.mockResolvedValue({
        response: { text: () => 'Nueva respuesta' },
      });

      await geminiService.generateResponse('Siguiente mensaje', history);

      expect(mockModel.startChat).toHaveBeenCalledWith({
        history,
        generationConfig: expect.any(Object),
      });
    });

    it('debe lanzar error si Gemini no genera respuesta', async () => {
      mockChat.sendMessage.mockResolvedValue({
        response: { text: () => '' },
      });

      await expect(
        geminiService.generateResponse('Test', [])
      ).rejects.toThrow('Gemini no generó una respuesta');
    });

    it('debe manejar errores de Gemini', async () => {
      mockChat.sendMessage.mockRejectedValue(new Error('Gemini API error'));

      await expect(
        geminiService.generateResponse('Test', [])
      ).rejects.toThrow('Gemini API error');
    });
  });

  describe('generateStreamResponse', () => {
    it('debe generar respuesta con streaming', async () => {
      const mockStream = [
        { text: () => 'Hola ' },
        { text: () => 'mundo' },
      ];

      mockChat.sendMessageStream.mockResolvedValue({
        stream: mockStream,
      });

      const result = await geminiService.generateStreamResponse('Mensaje', []);

      expect(result).toEqual(mockStream);
    });

    it('debe manejar errores en streaming', async () => {
      mockChat.sendMessageStream.mockRejectedValue(
        new Error('Stream error')
      );

      await expect(
        geminiService.generateStreamResponse('Test', [])
      ).rejects.toThrow('Stream error');
    });
  });

  describe('generateResponseWithParts', () => {
    it('debe generar respuesta con partes (texto + imagen)', async () => {
      const parts = [
        { text: 'Describe esta imagen' },
        {
          inlineData: {
            mimeType: 'image/png',
            data: 'base64data',
          },
        },
      ];

      mockChat.sendMessage.mockResolvedValue({
        response: { text: () => 'Es una imagen de...' },
      });

      const result = await geminiService.generateResponseWithParts(parts, []);

      expect(result).toBe('Es una imagen de...');
      expect(mockChat.sendMessage).toHaveBeenCalledWith(parts);
    });

    it('debe manejar solo texto', async () => {
      const parts = [{ text: 'Solo texto' }];

      mockChat.sendMessage.mockResolvedValue({
        response: { text: () => 'Respuesta' },
      });

      const result = await geminiService.generateResponseWithParts(parts, []);

      expect(result).toBe('Respuesta');
    });

    it('debe lanzar error si no genera respuesta', async () => {
      mockChat.sendMessage.mockResolvedValue({
        response: { text: () => null },
      });

      await expect(
        geminiService.generateResponseWithParts([{ text: 'Test' }], [])
      ).rejects.toThrow('Gemini no generó una respuesta');
    });
  });

  describe('generateStreamResponseWithParts', () => {
    it('debe generar stream con partes', async () => {
      const parts = [
        { text: 'Mensaje' },
        { inlineData: { mimeType: 'image/png', data: 'data' } },
      ];

      const mockStream = [{ text: () => 'Respuesta' }];

      mockChat.sendMessageStream.mockResolvedValue({
        stream: mockStream,
      });

      const result = await geminiService.generateStreamResponseWithParts(parts, []);

      expect(result).toEqual(mockStream);
      expect(mockChat.sendMessageStream).toHaveBeenCalledWith(parts);
    });

    it('debe manejar errores', async () => {
      mockChat.sendMessageStream.mockRejectedValue(
        new Error('Stream with parts error')
      );

      await expect(
        geminiService.generateStreamResponseWithParts([{ text: 'Test' }], [])
      ).rejects.toThrow('Stream with parts error');
    });
  });
});