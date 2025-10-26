import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messageParserService } from '../../../src/services/chat/messageParserService.js';

describe('MessageParserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('prepareMessageParts', () => {
    it('debe preparar mensaje solo con texto', () => {
      const result = messageParserService.prepareMessageParts('Hola bot', null);

      expect(result).toEqual([{ text: 'Hola bot' }]);
    });

    it('debe preparar mensaje con texto e imagen Base64', () => {
      const fileData = {
        category: 'image',
        url: 'data:image/png;base64,iVBORw0KGgo=',
        type: 'image/png',
      };

      const result = messageParserService.prepareMessageParts('Mira esta imagen', fileData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ text: 'Mira esta imagen' });
      expect(result[1]).toEqual({
        inlineData: {
          mimeType: 'image/png',
          data: 'iVBORw0KGgo=',
        },
      });
    });

    it('debe agregar pregunta por defecto si solo hay imagen sin texto', () => {
      const fileData = {
        category: 'image',
        url: 'data:image/jpeg;base64,/9j/4AAQSkZJ',
        type: 'image/jpeg',
      };

      const result = messageParserService.prepareMessageParts('', fileData);

      expect(result[0]).toEqual({ text: '¿Qué hay en esta imagen?' });
      expect(result[1]).toEqual({
        inlineData: {
          mimeType: 'image/jpeg',
          data: '/9j/4AAQSkZJ',
        },
      });
    });

    it('no debe agregar imagen si es URL de Supabase', () => {
      const fileData = {
        category: 'image',
        url: 'https://storage.supabase.com/image.png',
        type: 'image/png',
      };

      const result = messageParserService.prepareMessageParts('Imagen subida', fileData);

      // Solo debe tener el texto, no la imagen
      expect(result).toEqual([{ text: 'Imagen subida' }]);
    });

    it('debe ignorar archivos que no son imágenes', () => {
      const fileData = {
        category: 'document',
        url: 'https://storage.com/doc.pdf',
        type: 'application/pdf',
      };

      const result = messageParserService.prepareMessageParts('Documento', fileData);

      expect(result).toEqual([{ text: 'Documento' }]);
    });

    it('debe manejar mensaje vacío sin archivo', () => {
      const result = messageParserService.prepareMessageParts('', null);

      expect(result).toEqual([]);
    });
  });

  describe('parseImageData', () => {
    it('debe parsear imagen Base64', () => {
      const fileData = {
        url: 'data:image/png;base64,iVBORw0KGgo=',
        type: 'image/png',
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result).toEqual({
        inlineData: {
          mimeType: 'image/png',
          data: 'iVBORw0KGgo=',
        },
      });
    });

    it('debe parsear imagen JPEG Base64', () => {
      const fileData = {
        url: 'data:image/jpeg;base64,/9j/4AAQSkZJ',
        type: 'image/jpeg',
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result).toEqual({
        inlineData: {
          mimeType: 'image/jpeg',
          data: '/9j/4AAQSkZJ',
        },
      });
    });

    it('debe retornar null para URL de Supabase', () => {
      const fileData = {
        url: 'https://storage.supabase.com/image.png',
        type: 'image/png',
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result).toBeNull();
    });

    it('debe retornar null para URL HTTP normal', () => {
      const fileData = {
        url: 'http://example.com/image.png',
        type: 'image/png',
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result).toBeNull();
    });

    it('debe usar mime type por defecto si no está definido', () => {
      const fileData = {
        url: 'data:image/png;base64,ABC123',
        type: undefined,
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result.inlineData.mimeType).toBe('image/png');
    });

    it('debe manejar errores al parsear imagen', () => {
      const fileData = {
        url: null,
        type: 'image/png',
      };

      const result = messageParserService.parseImageData(fileData);

      expect(result).toBeNull();
    });

    it('debe detectar diferentes formatos Base64', () => {
      const formats = [
        'data:image/png;base64,ABC',
        'data:image/jpeg;base64,XYZ',
        'data:image/gif;base64,GIF',
        'data:image/webp;base64,WEBP',
      ];

      formats.forEach((url) => {
        const fileData = { url, type: url.split(';')[0].split(':')[1] };
        const result = messageParserService.parseImageData(fileData);

        expect(result).not.toBeNull();
        expect(result.inlineData.data).toBeTruthy();
      });
    });
  });
});