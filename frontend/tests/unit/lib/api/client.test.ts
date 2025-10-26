import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ApiClient } from '@/lib/api/client'

// Mock de fetch global
global.fetch = vi.fn()

describe('ApiClient - Unit Tests', () => {
  let client: ApiClient

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    client = new ApiClient('http://localhost:8000')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Constructor y configuración', () => {
    it('debe inicializar con URL base por defecto', () => {
      const defaultClient = new ApiClient()
      expect(defaultClient['baseUrl']).toBeDefined()
    })

    it('debe inicializar con URL base personalizada', () => {
      const customClient = new ApiClient('https://api.example.com')
      expect(customClient['baseUrl']).toBe('https://api.example.com')
    })
  })

  describe('Gestión de tokens', () => {
    it('debe guardar tokens en localStorage', () => {
      client['saveAuthTokens']('access-token-123', 'refresh-token-456')

      expect(localStorage.getItem('access_token')).toBe('access-token-123')
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456')
    })

    it('debe limpiar tokens de localStorage', () => {
      localStorage.setItem('access_token', 'token-123')
      localStorage.setItem('refresh_token', 'refresh-123')

      client['clearAuthTokens']()

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('debe obtener token desde localStorage', () => {
      localStorage.setItem('access_token', 'test-token')

      const token = client['getAuthToken']()

      expect(token).toBe('test-token')
    })

    it('debe retornar null si no hay token', () => {
      const token = client['getAuthToken']()

      expect(token).toBeNull()
    })
  })

  describe('Generación de headers', () => {
    it('debe generar headers sin autenticación', () => {
      const headers = client['getAuthHeaders']()

      expect(headers).toHaveProperty('Content-Type', 'application/json')
      expect(headers).not.toHaveProperty('Authorization')
    })

    it('debe generar headers con token de autenticación', () => {
      localStorage.setItem('access_token', 'test-token-123')

      const headers = client['getAuthHeaders']()

      expect(headers).toHaveProperty('Content-Type', 'application/json')
      expect(headers).toHaveProperty('Authorization', 'Bearer test-token-123')
    })
  })

  describe('Método GET', () => {
    it('debe hacer GET request exitoso', async () => {
      const mockData = { id: 1, name: 'Test' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await client['get']('/test')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      )
      expect(result).toEqual(mockData)
    })

    it('debe lanzar error en GET con respuesta 404', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      } as Response)

      await expect(client['get']('/test')).rejects.toThrow('Not found')
    })

    it('debe lanzar error genérico si no hay mensaje', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response)

      await expect(client['get']('/test')).rejects.toThrow('Error 500')
    })
  })

  describe('Método POST', () => {
    it('debe hacer POST request exitoso', async () => {
      const mockResponse = { success: true, id: 123 }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client['post']('/test', { name: 'Test' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Object),
          body: JSON.stringify({ name: 'Test' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe lanzar error en POST con respuesta 400', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      } as Response)

      await expect(client['post']('/test', { name: 'Test' })).rejects.toThrow('Bad request')
    })
  })

  describe('Método PATCH', () => {
    it('debe hacer PATCH request exitoso', async () => {
      const mockResponse = { updated: true }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client['patch']('/test', { name: 'Updated' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe manejar errores de PATCH con JSON', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({ message: 'Validation error' }),
      } as Response)

      await expect(client['patch']('/test', { name: '' })).rejects.toThrow('Validation error')
    })

    it('debe manejar errores de PATCH sin JSON', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as Response)

      await expect(client['patch']('/test', {})).rejects.toThrow('Error 500: Internal server error')
    })
  })

  describe('Método DELETE', () => {
    it('debe hacer DELETE request exitoso', async () => {
      const mockResponse = { deleted: true }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client['delete']('/test/123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe lanzar error en DELETE con respuesta 403', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Forbidden' }),
      } as Response)

      await expect(client['delete']('/test/123')).rejects.toThrow('Forbidden')
    })
  })

  describe('Método PUT', () => {
    it('debe hacer PUT request exitoso', async () => {
      const mockResponse = { updated: true }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client['put']('/test/123', { name: 'Updated' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/test/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ name: 'Updated' }),
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Método postStream', () => {
    it('debe retornar Response raw para streaming', async () => {
      const mockResponse = new Response('stream data', { status: 200 })

      vi.mocked(fetch).mockResolvedValueOnce(mockResponse)

      const result = await client['postStream']('/stream', { message: 'test' })

      expect(result).toBe(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/stream',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ message: 'test' }),
        })
      )
    })
  })

  describe('Método postFormData', () => {
    it('debe enviar FormData con token de autenticación', async () => {
      localStorage.setItem('access_token', 'test-token')

      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.txt'))

      const mockResponse = { uploaded: true }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await client['postFormData']('/upload', formData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe enviar FormData sin token si no está autenticado', async () => {
      const formData = new FormData()
      formData.append('file', new File(['test'], 'test.txt'))

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ uploaded: true }),
      } as Response)

      await client['postFormData']('/upload', formData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/upload',
        expect.objectContaining({
          method: 'POST',
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })

    it('debe lanzar error en upload fallido', async () => {
      const formData = new FormData()

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 413,
        json: async () => ({ error: 'File too large' }),
      } as Response)

      await expect(client['postFormData']('/upload', formData)).rejects.toThrow('File too large')
    })
  })
})