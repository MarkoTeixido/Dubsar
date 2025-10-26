import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/auth/useAuth'

vi.mock('@/lib/api/auth', () => ({
  auth: {
    getProfile: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

vi.mock('@/lib/storage', () => ({
  storage: {
    resetMessageCount: vi.fn(),
    clearAnonymousConversations: vi.fn(),
    setCurrentAnonymousId: vi.fn(),
  },
}))

describe('useAuth - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Estado inicial', () => {
    it('debe inicializar sin usuario cuando no hay token', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })

    it('debe exponer API pública correcta', () => {
      const { result } = renderHook(() => useAuth())

      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.register).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.updateProfile).toBe('function')
    })
  })

  describe('Validaciones', () => {
    it('debe rechazar actualización de perfil sin usuario autenticado', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        async () => await result.current.updateProfile({ fullName: 'Test' })
      ).rejects.toThrow('No hay usuario autenticado')
    })
  })
})