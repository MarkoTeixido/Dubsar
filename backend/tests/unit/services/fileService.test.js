import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileService } from '../../../src/services/file/fileService.js';
import { supabase, supabaseAdmin } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFileType', () => {
    it('debe aceptar imagen JPEG', () => {
      expect(fileService.validateFileType('image/jpeg')).toBe(true);
    });

    it('debe aceptar imagen PNG', () => {
      expect(fileService.validateFileType('image/png')).toBe(true);
    });

    it('debe aceptar PDF', () => {
      expect(fileService.validateFileType('application/pdf')).toBe(true);
    });

    it('debe aceptar documento Word', () => {
      expect(
        fileService.validateFileType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe(true);
    });

    it('debe rechazar tipo no permitido', () => {
      expect(() => fileService.validateFileType('video/mp4')).toThrow(
        'Tipo de archivo no permitido: video/mp4'
      );
    });

    it('debe rechazar ejecutable', () => {
      expect(() => fileService.validateFileType('application/x-msdownload')).toThrow();
    });
  });

  describe('validateFileSize', () => {
    it('debe aceptar archivo de 1MB', () => {
      expect(fileService.validateFileSize(1024 * 1024)).toBe(true);
    });

    it('debe aceptar archivo de 30MB (límite)', () => {
      expect(fileService.validateFileSize(30 * 1024 * 1024)).toBe(true);
    });

    it('debe rechazar archivo de 31MB', () => {
      expect(() => fileService.validateFileSize(31 * 1024 * 1024)).toThrow(
        'Archivo demasiado grande. Máximo: 30MB'
      );
    });

    it('debe rechazar archivo de 50MB', () => {
      expect(() => fileService.validateFileSize(50 * 1024 * 1024)).toThrow();
    });
  });

  describe('countUserFiles', () => {
    it('debe retornar 0 para usuario anónimo', async () => {
      const count = await fileService.countUserFiles(null);
      expect(count).toBe(0);
    });

    it('debe contar archivos de usuario autenticado', async () => {
      const mockConversations = [
        { id: 'conv-1' },
        { id: 'conv-2' },
      ];

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: mockConversations,
          error: null,
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          count: 3,
          error: null,
        }),
      });

      const count = await fileService.countUserFiles('user-123');
      expect(count).toBe(3);
    });

    it('debe retornar 0 si usuario no tiene conversaciones', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const count = await fileService.countUserFiles('user-123');
      expect(count).toBe(0);
    });

    it('debe manejar error y retornar 0', async () => {
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB error' },
        }),
      });

      const count = await fileService.countUserFiles('user-123');
      expect(count).toBe(0);
    });
  });

  describe('canUploadFile', () => {
    it('debe permitir subida si está bajo el límite (autenticado)', async () => {
      vi.spyOn(fileService, 'countUserFiles').mockResolvedValue(2);

      const result = await fileService.canUploadFile('user-123');

      expect(result).toEqual({
        canUpload: true,
        current: 2,
        limit: 4,
        remaining: 2,
      });
    });

    it('debe denegar subida si alcanzó límite (autenticado)', async () => {
      vi.spyOn(fileService, 'countUserFiles').mockResolvedValue(4);

      const result = await fileService.canUploadFile('user-123');

      expect(result).toEqual({
        canUpload: false,
        current: 4,
        limit: 4,
        remaining: 0,
      });
    });

    it('debe usar límite de 2 para usuario anónimo', async () => {
      vi.spyOn(fileService, 'countUserFiles').mockResolvedValue(0);

      const result = await fileService.canUploadFile(null);

      expect(result).toEqual({
        canUpload: true,
        current: 0,
        limit: 2,
        remaining: 2,
      });
    });
  });

  describe('uploadFile', () => {
    it('debe subir archivo correctamente', async () => {
      const mockBuffer = Buffer.from('test file content');

      supabaseAdmin.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'conv-123/mock-uuid-123.pdf' },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://storage.supabase.com/file.pdf' },
        }),
      });

      const result = await fileService.uploadFile(
        mockBuffer,
        'document.pdf',
        'application/pdf',
        'conv-123'
      );

      expect(result.url).toBe('https://storage.supabase.com/file.pdf');
      expect(result.path).toBe('conv-123/mock-uuid-123.pdf');
    });

    it('debe lanzar error si upload falla', async () => {
      const mockBuffer = Buffer.from('test');

      supabaseAdmin.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' },
        }),
      });

      await expect(
        fileService.uploadFile(mockBuffer, 'file.pdf', 'application/pdf', 'conv-123')
      ).rejects.toThrow('Error al subir el archivo');
    });
  });

  describe('deleteFile', () => {
    it('debe eliminar archivo correctamente', async () => {
      supabaseAdmin.storage.from.mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: null }),
      });

      const result = await fileService.deleteFile('conv-123/file.pdf');

      expect(result).toBe(true);
    });

    it('debe retornar false si delete falla', async () => {
      supabaseAdmin.storage.from.mockReturnValue({
        remove: vi.fn().mockResolvedValue({ error: { message: 'Failed' } }),
      });

      const result = await fileService.deleteFile('conv-123/file.pdf');

      expect(result).toBe(false);
    });
  });

  describe('isImage', () => {
    it('debe detectar JPEG como imagen', () => {
      expect(fileService.isImage('image/jpeg')).toBe(true);
    });

    it('debe detectar PNG como imagen', () => {
      expect(fileService.isImage('image/png')).toBe(true);
    });

    it('debe detectar que PDF no es imagen', () => {
      expect(fileService.isImage('application/pdf')).toBe(false);
    });
  });

  describe('getFileCategory', () => {
    it('debe categorizar imagen', () => {
      expect(fileService.getFileCategory('image/png')).toBe('image');
    });

    it('debe categorizar documento', () => {
      expect(fileService.getFileCategory('application/pdf')).toBe('document');
    });

    it('debe categorizar texto', () => {
      expect(fileService.getFileCategory('text/plain')).toBe('text');
    });

    it('debe categorizar JSON', () => {
      expect(fileService.getFileCategory('application/json')).toBe('json');
    });

    it('debe categorizar otros como other', () => {
      expect(fileService.getFileCategory('video/mp4')).toBe('other');
    });
  });
});