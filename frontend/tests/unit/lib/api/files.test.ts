import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { files } from '@/lib/api/files'

global.fetch = vi.fn()

describe('files - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Upload de archivos', () => {
    it('debe subir archivo PDF correctamente', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockFile = new File(['test content'], 'document.pdf', {
        type: 'application/pdf',
      })

      const mockResponse = {
        file: {
          url: 'https://storage.example.com/document.pdf',
          name: 'document.pdf',
          type: 'application/pdf',
          size: 1024,
          category: 'document',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await files.uploadFile(mockFile, 'conv-123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/files/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )

      // Verificar que se envió FormData
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const sentBody = callArgs[1]?.body as FormData
      expect(sentBody).toBeInstanceOf(FormData)
      expect(sentBody.get('conversationId')).toBe('conv-123')

      expect(result).toEqual(mockResponse)
    })

    it('debe subir archivo de imagen correctamente', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockFile = new File(['image data'], 'photo.jpg', {
        type: 'image/jpeg',
      })

      const mockResponse = {
        file: {
          url: 'https://storage.example.com/photo.jpg',
          name: 'photo.jpg',
          type: 'image/jpeg',
          size: 2048,
          category: 'image',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await files.uploadFile(mockFile, 'conv-456')

      expect(result.file.category).toBe('image')
      expect(result.file.type).toBe('image/jpeg')
    })

    it('debe lanzar error si el archivo es demasiado grande', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      })

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({ error: 'Archivo demasiado grande' }),
      } as Response)

      await expect(
        files.uploadFile(mockFile, 'conv-123')
      ).rejects.toThrow('Archivo demasiado grande')
    })

    it('debe lanzar error si el tipo de archivo no es válido', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockFile = new File(['test'], 'script.exe', {
        type: 'application/x-msdownload',
      })

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Tipo de archivo no permitido' }),
      } as Response)

      await expect(
        files.uploadFile(mockFile, 'conv-123')
      ).rejects.toThrow('Tipo de archivo no permitido')
    })

    it('debe lanzar error si no está autenticado', async () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      })

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'No autorizado' }),
      } as Response)

      await expect(
        files.uploadFile(mockFile, 'conv-123')
      ).rejects.toThrow('No autorizado')
    })

    it('debe incluir conversationId en el FormData', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          file: {
            url: 'https://example.com/test.txt',
            name: 'test.txt',
            type: 'text/plain',
            size: 4,
            category: 'document',
          },
        }),
      } as Response)

      await files.uploadFile(mockFile, 'conv-xyz')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const sentBody = callArgs[1]?.body as FormData
      expect(sentBody.get('conversationId')).toBe('conv-xyz')
      expect(sentBody.get('file')).toBeInstanceOf(File)
    })
  })

  describe('Estado de upload', () => {
    it('debe obtener estado de uploads', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockStatus = {
        max_file_size: 10485760, // 10MB
        allowed_types: ['image/jpeg', 'image/png', 'application/pdf'],
        uploads_count: 5,
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response)

      const result = await files.getFileUploadStatus()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/files/status',
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockStatus)
    })

    it('debe lanzar error si falla obtener estado', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response)

      await expect(files.getFileUploadStatus()).rejects.toThrow('Server error')
    })
  })
})