import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamingService } from '../../../src/services/chat/streamingService.js';
import { geminiService } from '../../../src/services/integrations/geminiService.js';
import { chatService } from '../../../src/services/chat/chatService.js';

// Mock del config de Gemini
vi.mock('../../../src/config/gemini.js', () => ({
  geminiClient: {
    getGenerativeModel: vi.fn(),
  },
  GEMINI_MODEL: 'gemini-test',
  GEMINI_CONFIG: { maxOutputTokens: 2048, temperature: 0.7 },
}));

vi.mock('../../../src/services/integrations/geminiService.js');
vi.mock('../../../src/services/chat/chatService.js');

describe('StreamingService', () => {
  let res;

  beforeEach(() => {
    res = {
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('setupSSE', () => {
    it('debe configurar headers correctos para SSE', () => {
      streamingService.setupSSE(res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(res.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');
      expect(res.setHeader).toHaveBeenCalledTimes(4);
    });
  });

  describe('sendChunk', () => {
    it('debe enviar chunk con formato SSE correcto', () => {
      const data = { chunk: 'Hola mundo' };

      streamingService.sendChunk(res, data);

      expect(res.write).toHaveBeenCalledWith(
        'data: {"chunk":"Hola mundo"}\n\n'
      );
    });

    it('debe serializar objetos complejos', () => {
      const data = {
        chunk: 'Texto',
        metadata: { tokens: 10 },
      };

      streamingService.sendChunk(res, data);

      expect(res.write).toHaveBeenCalledWith(
        'data: {"chunk":"Texto","metadata":{"tokens":10}}\n\n'
      );
    });

    it('debe manejar chunks vacíos', () => {
      streamingService.sendChunk(res, {});

      expect(res.write).toHaveBeenCalledWith('data: {}\n\n');
    });

    it('debe manejar señal de done', () => {
      streamingService.sendChunk(res, { done: true });

      expect(res.write).toHaveBeenCalledWith('data: {"done":true}\n\n');
    });

    it('debe manejar errores', () => {
      streamingService.sendChunk(res, { error: 'Something failed' });

      expect(res.write).toHaveBeenCalledWith(
        'data: {"error":"Something failed"}\n\n'
      );
    });
  });

  describe('processStream', () => {
    it('debe procesar stream exitosamente para usuario autenticado', async () => {
      const mockStream = [
        { text: () => 'Hola ' },
        { text: () => 'mundo' },
        { text: () => '!' },
      ];

      geminiService.generateStreamResponseWithParts.mockResolvedValue(mockStream);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-123',
        [{ text: 'Test' }],
        [],
        'user-123'
      );

      // Verificar que se enviaron los 3 chunks
      expect(res.write).toHaveBeenCalledTimes(4); // 3 chunks + done
      expect(res.write).toHaveBeenCalledWith('data: {"chunk":"Hola "}\n\n');
      expect(res.write).toHaveBeenCalledWith('data: {"chunk":"mundo"}\n\n');
      expect(res.write).toHaveBeenCalledWith('data: {"chunk":"!"}\n\n');
      expect(res.write).toHaveBeenCalledWith('data: {"done":true}\n\n');

      // Verificar que se guardó la respuesta completa
      expect(chatService.saveBotResponse).toHaveBeenCalledWith(
        'user-123',
        'conv-123',
        'Hola mundo!'
      );

      expect(res.end).toHaveBeenCalled();
    });

    it('debe procesar stream para usuario anónimo', async () => {
      const mockStream = [{ text: () => 'Respuesta anónima' }];

      geminiService.generateStreamResponseWithParts.mockResolvedValue(mockStream);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-anon',
        [{ text: 'Test' }],
        [],
        null
      );

      expect(res.write).toHaveBeenCalledTimes(2); // 1 chunk + done
      expect(chatService.saveBotResponse).toHaveBeenCalledWith(
        null,
        'conv-anon',
        'Respuesta anónima'
      );
    });

    it('debe manejar stream vacío', async () => {
      geminiService.generateStreamResponseWithParts.mockResolvedValue([]);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-123',
        [{ text: 'Test' }],
        [],
        'user-123'
      );

      // Solo debe enviar done
      expect(res.write).toHaveBeenCalledTimes(1);
      expect(res.write).toHaveBeenCalledWith('data: {"done":true}\n\n');

      // Debe guardar respuesta vacía
      expect(chatService.saveBotResponse).toHaveBeenCalledWith(
        'user-123',
        'conv-123',
        ''
      );
    });

    it('debe manejar errores en el stream', async () => {
      const error = new Error('Gemini API error');
      geminiService.generateStreamResponseWithParts.mockRejectedValue(error);

      await expect(
        streamingService.processStream(
          res,
          'conv-123',
          [{ text: 'Test' }],
          [],
          'user-123'
        )
      ).rejects.toThrow('Gemini API error');

      // Debe enviar error al cliente
      expect(res.write).toHaveBeenCalledWith(
        'data: {"error":"Gemini API error"}\n\n'
      );
      expect(res.end).toHaveBeenCalled();
    });

    it('debe construir respuesta completa correctamente', async () => {
      const mockStream = [
        { text: () => 'La ' },
        { text: () => 'respuesta ' },
        { text: () => 'es ' },
        { text: () => '42' },
      ];

      geminiService.generateStreamResponseWithParts.mockResolvedValue(mockStream);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-123',
        [{ text: 'Test' }],
        [],
        'user-123'
      );

      expect(chatService.saveBotResponse).toHaveBeenCalledWith(
        'user-123',
        'conv-123',
        'La respuesta es 42'
      );
    });

    it('debe pasar historial correcto a Gemini', async () => {
      const mockHistory = [
        { role: 'user', parts: [{ text: 'Hola' }] },
        { role: 'model', parts: [{ text: 'Hola!' }] },
      ];

      const mockStream = [{ text: () => 'Siguiente respuesta' }];

      geminiService.generateStreamResponseWithParts.mockResolvedValue(mockStream);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-123',
        [{ text: 'Nuevo mensaje' }],
        mockHistory,
        'user-123'
      );

      expect(geminiService.generateStreamResponseWithParts).toHaveBeenCalledWith(
        [{ text: 'Nuevo mensaje' }],
        mockHistory
      );
    });

    it('debe manejar chunks con caracteres especiales', async () => {
      const mockStream = [
        { text: () => 'Texto con "comillas" y \n saltos' },
      ];

      geminiService.generateStreamResponseWithParts.mockResolvedValue(mockStream);
      chatService.saveBotResponse.mockResolvedValue();

      await streamingService.processStream(
        res,
        'conv-123',
        [{ text: 'Test' }],
        [],
        'user-123'
      );

      // Verificar que JSON se serializa correctamente
      expect(res.write).toHaveBeenCalledWith(
        expect.stringContaining('Texto con \\"comillas\\"')
      );
    });
  });
});