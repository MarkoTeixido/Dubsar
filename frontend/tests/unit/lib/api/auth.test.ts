import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { auth } from '@/lib/api/auth'

// Mock de fetch global
global.fetch = vi.fn()

describe('auth - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Registro de usuarios', () => {
    it('debe registrar usuario con email y password', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await auth.register('test@example.com', 'password123', 'Test User')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
          }),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('debe registrar usuario sin nombre completo', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: 'user-123' } }),
      } as Response)

      await auth.register('test@example.com', 'password123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/register',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            fullName: undefined,
          }),
        })
      )
    })

    it('debe lanzar error si el email ya existe', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Email ya existe' }),
      } as Response)

      await expect(
        auth.register('existing@example.com', 'password123')
      ).rejects.toThrow('Email ya existe')
    })
  })

  describe('Login de usuarios', () => {
    it('debe hacer login y guardar tokens', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
        },
        session: {
          access_token: 'access-token-123',
          refresh_token: 'refresh-token-456',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await auth.login('test@example.com', 'password123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      )

      // Verificar que se guardaron los tokens
      expect(localStorage.getItem('access_token')).toBe('access-token-123')
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456')

      expect(result).toEqual(mockResponse)
    })

    it('debe hacer login sin guardar tokens si no hay session', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      await auth.login('test@example.com', 'password123')

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('debe lanzar error con credenciales incorrectas', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Credenciales incorrectas' }),
      } as Response)

      await expect(
        auth.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Credenciales incorrectas')
    })
  })

  describe('Logout de usuarios', () => {
    it('debe hacer logout y limpiar tokens', async () => {
      localStorage.setItem('access_token', 'token-123')
      localStorage.setItem('refresh_token', 'refresh-123')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await auth.logout()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      )

      // Verificar que se limpiaron los tokens
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('debe limpiar tokens incluso si la API falla', async () => {
      localStorage.setItem('access_token', 'token-123')

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(auth.logout()).rejects.toThrow()

      // Tokens deben limpiarse de todas formas
      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  describe('Obtener perfil', () => {
    it('debe obtener perfil de usuario autenticado', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockProfile = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      } as Response)

      const result = await auth.getProfile()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/me',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockProfile)
    })

    it('debe lanzar error si no hay token', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'No autorizado' }),
      } as Response)

      await expect(auth.getProfile()).rejects.toThrow('No autorizado')
    })
  })

  describe('Actualizar perfil', () => {
    it('debe actualizar nombre completo', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockUpdated = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          fullName: 'Updated Name',
          avatar: null,
        },
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdated,
      } as Response)

      const result = await auth.updateProfile({ fullName: 'Updated Name' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/profile',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ fullName: 'Updated Name' }),
        })
      )
      expect(result).toEqual(mockUpdated)
    })

    it('debe actualizar avatar', async () => {
      localStorage.setItem('access_token', 'test-token')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            id: 'user-123',
            avatar: 'https://example.com/new-avatar.jpg',
          },
        }),
      } as Response)

      await auth.updateProfile({ avatar: 'https://example.com/new-avatar.jpg' })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/profile',
        expect.objectContaining({
          body: JSON.stringify({ avatar: 'https://example.com/new-avatar.jpg' }),
        })
      )
    })

    it('debe actualizar nombre y avatar simultáneamente', async () => {
      localStorage.setItem('access_token', 'test-token')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: 'user-123' } }),
      } as Response)

      await auth.updateProfile({
        fullName: 'New Name',
        avatar: 'https://example.com/avatar.jpg',
      })

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/profile',
        expect.objectContaining({
          body: JSON.stringify({
            fullName: 'New Name',
            avatar: 'https://example.com/avatar.jpg',
          }),
        })
      )
    })
  })

  describe('Eliminar cuenta', () => {
    it('debe eliminar cuenta y limpiar tokens', async () => {
      localStorage.setItem('access_token', 'token-123')
      localStorage.setItem('refresh_token', 'refresh-123')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await auth.deleteAccount()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/account',
        expect.objectContaining({
          method: 'DELETE',
        })
      )

      // Verificar que se limpiaron los tokens
      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('debe limpiar tokens incluso si la eliminación falla', async () => {
      localStorage.setItem('access_token', 'token-123')

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Server error'))

      await expect(auth.deleteAccount()).rejects.toThrow()

      expect(localStorage.getItem('access_token')).toBeNull()
    })
  })

  describe('Google OAuth', () => {
    it('debe redirigir a URL de Google OAuth', async () => {
      const mockGoogleUrl = 'https://accounts.google.com/o/oauth2/auth?...'

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: mockGoogleUrl }),
      } as Response)

      // Mock de window.location.href
      const hrefSpy = vi.fn()
      Object.defineProperty(window, 'location', {
        value: {
          href: '',
          origin: 'http://localhost:3000',
        },
        writable: true,
        configurable: true,
      })

      Object.defineProperty(window.location, 'href', {
        set: hrefSpy,
        get: () => mockGoogleUrl,
      })

      await auth.signInWithGoogle()

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/oauth/google?redirectUrl='),
        expect.any(Object)
      )
      expect(hrefSpy).toHaveBeenCalledWith(mockGoogleUrl)
    })

    it('debe lanzar error si no se obtiene URL de OAuth', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: null }),
      } as Response)

      await expect(auth.signInWithGoogle()).rejects.toThrow(
        'No se pudo obtener URL de Google OAuth'
      )
    })
  })
})