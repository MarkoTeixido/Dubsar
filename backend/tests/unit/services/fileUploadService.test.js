import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileUploadService } from '../../../src/services/file/fileUploadService.js';
import { fileService } from '../../../src/services/file/fileService.js';

vi.mock('../../../src/services/file/fileService.js');

describe('FileUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFilePresence', () => {
    it('debe validar que existe un archivo', () => {
      const file = { originalname: 'test.pdf' };
      expect(() => fileUploadService.validateFilePresence(file)).not.toThrow();
    });

    it('debe lanzar error si no hay archivo', () => {
      expect(() => fileUploadService.validateFilePresence(null)).toThrow(
        'VALIDATION: No se recibió ningún archivo'
      );
    });

    it('debe lanzar error si archivo es undefined', () => {
      expect(() => fileUploadService.validateFilePresence(undefined)).toThrow();
    });
  });

  describe('validateConversationId', () => {
    it('debe validar conversationId presente', () => {
      expect(() => fileUploadService.validateConversationId('conv-123')).not.toThrow();
    });

    it('debe lanzar error si no hay conversationId', () => {
      expect(() => fileUploadService.validateConversationId(null)).toThrow(
        'VALIDATION: conversationId es requerido'
      );
    });

    it('debe lanzar error si conversationId es string vacío', () => {
      expect(() => fileUploadService.validateConversationId('')).toThrow();
    });
  });

  describe('validateFile', () => {
    it('debe validar archivo completo correctamente', () => {
      const file = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024,
      };

      fileService.validateFileType.mockReturnValue(true);
      fileService.validateFileSize.mockReturnValue(true);

      expect(() => fileUploadService.validateFile(file)).not.toThrow();
      expect(fileService.validateFileType).toHaveBeenCalledWith('application/pdf');
      expect(fileService.validateFileSize).toHaveBeenCalledWith(1024 * 1024);
    });

    it('debe lanzar error si tipo no es válido', () => {
      const file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 1024,
      };

      fileService.validateFileType.mockImplementation(() => {
        throw new Error('Tipo no permitido');
      });

      expect(() => fileUploadService.validateFile(file)).toThrow('Tipo no permitido');
    });

    it('debe lanzar error si tamaño excede límite', () => {
      const file = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 50 * 1024 * 1024,
      };

      fileService.validateFileType.mockReturnValue(true);
      fileService.validateFileSize.mockImplementation(() => {
        throw new Error('Archivo demasiado grande');
      });

      expect(() => fileUploadService.validateFile(file)).toThrow(
        'Archivo demasiado grande'
      );
    });
  });

  describe('checkUploadPermissions', () => {
    it('debe permitir subida si está bajo el límite', async () => {
      fileService.canUploadFile.mockResolvedValue({
        canUpload: true,
        current: 2,
        limit: 4,
        remaining: 2,
      });

      const result = await fileUploadService.checkUploadPermissions('user-123');

      expect(result.canUpload).toBe(true);
      expect(result.current).toBe(2);
    });

    it('debe denegar subida si alcanzó límite (autenticado)', async () => {
      fileService.canUploadFile.mockResolvedValue({
        canUpload: false,
        current: 4,
        limit: 4,
        remaining: 0,
      });

      await expect(
        fileUploadService.checkUploadPermissions('user-123')
      ).rejects.toThrow('Has alcanzado el límite de 4 archivos');
    });

    it('debe mostrar mensaje específico para usuario anónimo', async () => {
      fileService.canUploadFile.mockResolvedValue({
        canUpload: false,
        current: 2,
        limit: 2,
        remaining: 0,
      });

      try {
        await fileUploadService.checkUploadPermissions(null);
      } catch (error) {
        expect(error.message).toContain('Regístrate para subir hasta 4 archivos');
        expect(error.code).toBe('LIMIT_REACHED');
        expect(error.limit).toBe(2);
        expect(error.current).toBe(2);
      }
    });
  });

  describe('processFileUpload', () => {
    it('debe procesar subida completa correctamente', async () => {
      const file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
        buffer: Buffer.from('test content'),
      };

      const mockUploadStatus = {
        canUpload: true,
        current: 1,
        limit: 4,
        remaining: 3,
      };

      const mockUploadResult = {
        url: 'https://storage.com/file.pdf',
        path: 'conv-123/file.pdf',
      };

      fileService.validateFileType.mockReturnValue(true);
      fileService.validateFileSize.mockReturnValue(true);
      fileService.canUploadFile.mockResolvedValue(mockUploadStatus);
      fileService.uploadFile.mockResolvedValue(mockUploadResult);

      const result = await fileUploadService.processFileUpload(
        file,
        'conv-123',
        'user-123'
      );

      expect(result.uploadResult).toEqual(mockUploadResult);
      expect(result.uploadStatus).toEqual(mockUploadStatus);
      expect(result.file).toEqual(file);
    });

    it('debe rechazar archivo inválido', async () => {
      const file = {
        originalname: 'video.mp4',
        mimetype: 'video/mp4',
        size: 1024,
        buffer: Buffer.from('test'),
      };

      fileService.validateFileType.mockImplementation(() => {
        throw new Error('Tipo no permitido');
      });

      await expect(
        fileUploadService.processFileUpload(file, 'conv-123', 'user-123')
      ).rejects.toThrow('Tipo no permitido');
    });

    it('debe rechazar si se alcanzó el límite', async () => {
      const file = {
        originalname: 'doc.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test'),
      };

      fileService.validateFileType.mockReturnValue(true);
      fileService.validateFileSize.mockReturnValue(true);
      fileService.canUploadFile.mockResolvedValue({
        canUpload: false,
        current: 4,
        limit: 4,
        remaining: 0,
      });

      await expect(
        fileUploadService.processFileUpload(file, 'conv-123', 'user-123')
      ).rejects.toThrow('Has alcanzado el límite');
    });
  });

  describe('buildUploadResponse', () => {
    it('debe construir respuesta correcta', () => {
      const uploadResult = {
        url: 'https://storage.com/file.pdf',
        path: 'conv-123/file.pdf',
      };

      const uploadStatus = {
        current: 2,
        limit: 4,
        remaining: 2,
      };

      const file = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 2048,
      };

      fileService.getFileCategory.mockReturnValue('document');

      const result = fileUploadService.buildUploadResponse(
        uploadResult,
        uploadStatus,
        file
      );

      expect(result).toEqual({
        success: true,
        file: {
          url: 'https://storage.com/file.pdf',
          name: 'document.pdf',
          type: 'application/pdf',
          size: 2048,
          category: 'document',
        },
        uploadStatus: {
          current: 3,
          limit: 4,
          remaining: 1,
        },
      });
    });

    it('debe categorizar imagen correctamente', () => {
      const uploadResult = { url: 'https://storage.com/img.png' };
      const uploadStatus = { current: 0, limit: 4, remaining: 4 };
      const file = {
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 1024,
      };

      fileService.getFileCategory.mockReturnValue('image');

      const result = fileUploadService.buildUploadResponse(
        uploadResult,
        uploadStatus,
        file
      );

      expect(result.file.category).toBe('image');
    });
  });

  describe('getUploadStatus', () => {
    it('debe retornar estado para usuario autenticado', async () => {
      fileService.canUploadFile.mockResolvedValue({
        canUpload: true,
        current: 2,
        limit: 4,
        remaining: 2,
      });

      const result = await fileUploadService.getUploadStatus('user-123');

      expect(result).toEqual({
        success: true,
        canUpload: true,
        current: 2,
        limit: 4,
        remaining: 2,
      });
    });

    it('debe retornar estado para usuario anónimo', async () => {
      fileService.canUploadFile.mockResolvedValue({
        canUpload: true,
        current: 1,
        limit: 2,
        remaining: 1,
      });

      const result = await fileUploadService.getUploadStatus(null);

      expect(result.limit).toBe(2);
    });
  });
});