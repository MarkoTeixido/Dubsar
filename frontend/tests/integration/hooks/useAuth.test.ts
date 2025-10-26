import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/auth/useAuth'
import { auth } from '@/lib/api/auth'
import { storage } from '@/lib/storage'

// Mock de API auth
vi.mock('@/lib/api/auth', () => ({
  auth: {
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

// Mock de storage
vi.mock('@/lib/storage', () => ({
  storage: {
    resetMessageCount: vi.fn(),
    clearAnonymousConversations: vi.fn(),
    setCurrentAnonymousId: vi.fn(),
  },
}))

describe('useAuth - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Autenticación con tokens', () => {
    it('debe restaurar sesión desde token válido en localStorage', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
      }

      localStorage.setItem('access_token', 'mock-token')
      localStorage.setItem('refresh_token', 'mock-refresh')
      vi.mocked(auth.getProfile).mockResolvedValueOnce({ user: mockUser })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isAuthenticated).toBe(true)
      }, { timeout: 3000 })

      expect(result.current.user).toEqual(mockUser)
      expect(auth.getProfile).toHaveBeenCalled()
    })

    it('debe limpiar tokens inválidos y resetear estado', async () => {
      localStorage.setItem('access_token', 'invalid-token')
      vi.mocked(auth.getProfile).mockRejectedValueOnce(new Error('Token inválido'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      }, { timeout: 3000 })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      
      await waitFor(() => {
        expect(localStorage.getItem('access_token')).toBeNull()
      }, { timeout: 1000 })
    })
  })

  describe('Flujo de Login', () => {
    it('debe autenticar usuario, guardar tokens y limpiar datos anónimos', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
      }

      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() + 3600000,
      }

      vi.mocked(auth.login).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(auth.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(storage.resetMessageCount).toHaveBeenCalled()
      expect(storage.clearAnonymousConversations).toHaveBeenCalled()
      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    it('debe propagar errores de credenciales inválidas', async () => {
      vi.mocked(auth.login).mockRejectedValueOnce(new Error('Credenciales incorrectas'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        async () => await result.current.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Credenciales incorrectas')

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Flujo de Registro', () => {
    it('debe registrar usuario y hacer login automático', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
      }

      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() + 3600000,
      }

      vi.mocked(auth.register).mockResolvedValueOnce(undefined)
      vi.mocked(auth.login).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.register('test@example.com', 'password123', 'Test User')
      })

      expect(auth.register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
      expect(auth.login).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(storage.resetMessageCount).toHaveBeenCalled()
      expect(storage.clearAnonymousConversations).toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('debe propagar errores de email duplicado', async () => {
      vi.mocked(auth.register).mockRejectedValueOnce(new Error('Email ya existe'))

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        async () => await result.current.register('test@example.com', 'password', 'Test')
      ).rejects.toThrow('Email ya existe')

      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Flujo de Logout', () => {
    it('debe cerrar sesión y limpiar todos los datos', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
      }

      localStorage.setItem('access_token', 'mock-token')
      vi.mocked(auth.getProfile).mockResolvedValueOnce({ user: mockUser })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      }, { timeout: 3000 })

      vi.mocked(auth.logout).mockResolvedValueOnce(undefined)

      await act(async () => {
        await result.current.logout()
      })

      expect(auth.logout).toHaveBeenCalled()
      expect(storage.clearAnonymousConversations).toHaveBeenCalled()
      expect(storage.resetMessageCount).toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('Actualización de Perfil', () => {
    it('debe actualizar datos del usuario autenticado', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        avatar: null,
      }

      const updatedUser = {
        ...mockUser,
        fullName: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      }

      localStorage.setItem('access_token', 'mock-token')
      vi.mocked(auth.getProfile).mockResolvedValueOnce({ user: mockUser })
      vi.mocked(auth.updateProfile).mockResolvedValueOnce({ user: updatedUser })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      }, { timeout: 3000 })

      await act(async () => {
        await result.current.updateProfile({
          fullName: 'Updated Name',
          avatar: 'https://example.com/avatar.jpg',
        })
      })

      expect(auth.updateProfile).toHaveBeenCalledWith({
        fullName: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
      })
      expect(result.current.user).toEqual(updatedUser)
    })
  })
})