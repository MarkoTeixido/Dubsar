import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useConversations } from '@/hooks/conversations/useConversations'
import { conversations as conversationsApi } from '@/lib/api/conversations'
import { storage } from '@/lib/storage'

// Mock de API conversations
vi.mock('@/lib/api/conversations', () => ({
  conversations: {
    getConversations: vi.fn(),
    createConversation: vi.fn(),
    deleteConversation: vi.fn(),
    updateConversationTitle: vi.fn(),
  },
}))

// Mock de storage
vi.mock('@/lib/storage', () => ({
  storage: {
    getAnonymousConversations: vi.fn(),
    getCurrentAnonymousId: vi.fn(),
    setCurrentAnonymousId: vi.fn(),
    saveAnonymousConversation: vi.fn(),
    deleteAnonymousConversation: vi.fn(),
    getAnonymousConversation: vi.fn(),
    generateAnonymousId: vi.fn(),
    clearAnonymousConversations: vi.fn(),
  },
}))

describe('useConversations - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Usuarios autenticados - API', () => {
    it('debe cargar conversaciones desde API y limpiar datos anónimos', async () => {
      const mockConversations = [
        {
          id: '1',
          title: 'Conversación 1',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
          user_id: 'user-123',
        },
        {
          id: '2',
          title: 'Conversación 2',
          created_at: '2025-01-02',
          updated_at: '2025-01-02',
          user_id: 'user-123',
        },
      ]

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce(mockConversations)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2)
      })

      // Verificar carga desde API
      expect(conversationsApi.getConversations).toHaveBeenCalled()
      
      // Verificar limpieza de datos anónimos
      expect(storage.clearAnonymousConversations).toHaveBeenCalled()
      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('')
      
      // Verificar selección de conversación más reciente
      expect(result.current.currentConversationId).toBe('1')
    })

    it('debe crear primera conversación automáticamente si usuario nuevo', async () => {
      const newConv = {
        id: 'new-1',
        title: 'Nueva conversación',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        user_id: 'user-123',
      }

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce([])
      vi.mocked(conversationsApi.createConversation).mockResolvedValueOnce(newConv)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      expect(conversationsApi.createConversation).toHaveBeenCalledWith('Nueva conversación')
      expect(result.current.currentConversationId).toBe('new-1')
      expect(result.current.conversations[0]).toEqual(newConv)
    })

    it('debe crear nueva conversación en API y agregarla al inicio', async () => {
      const existingConv = {
        id: 'existing',
        title: 'Existente',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        user_id: 'user-123',
      }

      const newConv = {
        id: 'new-2',
        title: 'Nueva conversación',
        created_at: '2025-01-02',
        updated_at: '2025-01-02',
        user_id: 'user-123',
      }

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce([existingConv])
      vi.mocked(conversationsApi.createConversation).mockResolvedValueOnce(newConv)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      await act(async () => {
        await result.current.createConversation()
      })

      expect(conversationsApi.createConversation).toHaveBeenCalledWith('Nueva conversación')
      expect(result.current.conversations).toHaveLength(2)
      expect(result.current.conversations[0].id).toBe('new-2') // Nueva al inicio
      expect(result.current.currentConversationId).toBe('new-2') // Auto-seleccionada
    })

    it('debe eliminar conversación de API y seleccionar siguiente', async () => {
      const mockConversations = [
        { id: '1', title: 'Conv 1', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { id: '2', title: 'Conv 2', created_at: '2025-01-02', updated_at: '2025-01-02' },
      ]

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce(mockConversations)
      vi.mocked(conversationsApi.deleteConversation).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(2)
        expect(result.current.currentConversationId).toBe('1')
      })

      await act(async () => {
        await result.current.deleteConversation('1')
      })

      // Verificar llamada a API
      expect(conversationsApi.deleteConversation).toHaveBeenCalledWith('1')
      
      // Verificar estado actualizado
      expect(result.current.conversations).toHaveLength(1)
      expect(result.current.conversations[0].id).toBe('2')
      
      // Verificar auto-selección de siguiente conversación
      expect(result.current.currentConversationId).toBe('2')
    })

    it('debe actualizar título en API y reflejar cambio en estado', async () => {
      const mockConversations = [
        { id: '1', title: 'Título original', created_at: '2025-01-01', updated_at: '2025-01-01' },
      ]

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce(mockConversations)
      vi.mocked(conversationsApi.updateConversationTitle).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      await act(async () => {
        await result.current.updateConversationTitle('1', 'Título actualizado')
      })

      // Verificar llamada a API
      expect(conversationsApi.updateConversationTitle).toHaveBeenCalledWith('1', 'Título actualizado')
      
      // Verificar actualización local
      expect(result.current.conversations[0].title).toBe('Título actualizado')
    })

    it('debe manejar error al auto-crear primera conversación', async () => {
      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce([])
      vi.mocked(conversationsApi.createConversation).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useConversations(true))

      // Esperar a que termine de cargar
      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(0)
      })

      // Verificar que intentó crear
      expect(conversationsApi.createConversation).toHaveBeenCalledWith('Nueva conversación')
      
      // Verificar estado limpio después del error
      expect(result.current.currentConversationId).toBeNull()
    })

    it('debe propagar error al crear conversación manualmente', async () => {
      const existingConv = {
        id: 'existing',
        title: 'Existente',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        user_id: 'user-123',
      }

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce([existingConv])
      vi.mocked(conversationsApi.createConversation).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      // Intentar crear manualmente y esperar que falle
      await expect(async () => {
        await act(async () => {
          await result.current.createConversation()
        })
      }).rejects.toThrow('Network error')

      // Estado debe mantenerse igual
      expect(result.current.conversations).toHaveLength(1)
    })
  })

  describe('Usuarios anónimos - localStorage', () => {
    it('debe cargar conversaciones desde localStorage', async () => {
      const mockAnonymousConvs = [
        { id: 'anon-1', title: 'Conv Anónima', created_at: '2025-01-01', updated_at: '2025-01-01', messages: [] },
      ]

      vi.mocked(storage.getAnonymousConversations).mockReturnValueOnce(mockAnonymousConvs)
      vi.mocked(storage.getCurrentAnonymousId).mockReturnValueOnce('anon-1')

      const { result } = renderHook(() => useConversations(false))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      expect(storage.getAnonymousConversations).toHaveBeenCalled()
      expect(result.current.currentConversationId).toBe('anon-1')
    })

    it('debe crear conversación anónima en localStorage', async () => {
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([])
      vi.mocked(storage.generateAnonymousId).mockReturnValueOnce('anon-new')

      const { result } = renderHook(() => useConversations(false))

      await act(async () => {
        await result.current.createConversation()
      })

      // Verificar guardado en localStorage
      expect(storage.saveAnonymousConversation).toHaveBeenCalled()
      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('anon-new')
      
      // Verificar estado actualizado
      expect(result.current.currentConversationId).toBe('anon-new')
      expect(result.current.conversations[0].id).toBe('anon-new')
    })

    it('debe eliminar conversación anónima y actualizar selección', async () => {
      const mockAnonymousConvs = [
        { id: 'anon-1', title: 'Conv 1', created_at: '2025-01-01', updated_at: '2025-01-01', messages: [] },
        { id: 'anon-2', title: 'Conv 2', created_at: '2025-01-02', updated_at: '2025-01-02', messages: [] },
      ]

      vi.mocked(storage.getAnonymousConversations).mockReturnValue(mockAnonymousConvs)
      vi.mocked(storage.getCurrentAnonymousId).mockReturnValue('anon-1')

      const { result } = renderHook(() => useConversations(false))

      await act(async () => {
        await result.current.deleteConversation('anon-1')
      })

      // Verificar eliminación en localStorage
      expect(storage.deleteAnonymousConversation).toHaveBeenCalledWith('anon-1')
      
      // Verificar auto-selección de siguiente
      expect(result.current.currentConversationId).toBe('anon-2')
    })

    it('debe actualizar título en localStorage', async () => {
      const mockConv = {
        id: 'anon-1',
        title: 'Título original',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [],
      }

      vi.mocked(storage.getAnonymousConversations).mockReturnValue([mockConv])
      vi.mocked(storage.getAnonymousConversation).mockReturnValueOnce(mockConv)

      const { result } = renderHook(() => useConversations(false))

      await act(async () => {
        await result.current.updateConversationTitle('anon-1', 'Nuevo título')
      })

      // Verificar guardado en localStorage
      expect(storage.saveAnonymousConversation).toHaveBeenCalled()
      
      // Verificar actualización en estado
      expect(result.current.conversations[0].title).toBe('Nuevo título')
    })

    it('debe actualizar conversationId seleccionada en localStorage', async () => {
      const mockAnonymousConvs = [
        { id: 'anon-1', title: 'Conv 1', created_at: '2025-01-01', updated_at: '2025-01-01', messages: [] },
        { id: 'anon-2', title: 'Conv 2', created_at: '2025-01-02', updated_at: '2025-01-02', messages: [] },
      ]

      vi.mocked(storage.getAnonymousConversations).mockReturnValue(mockAnonymousConvs)
      vi.mocked(storage.getCurrentAnonymousId).mockReturnValue('anon-1')

      const { result } = renderHook(() => useConversations(false))

      await waitFor(() => {
        expect(result.current.currentConversationId).toBe('anon-1')
      })

      act(() => {
        result.current.setCurrentConversationId('anon-2')
      })

      // Verificar guardado en localStorage
      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('anon-2')
      
      // Verificar actualización de estado
      expect(result.current.currentConversationId).toBe('anon-2')
    })

    it('debe seleccionar primera conversación si no hay ID guardado', async () => {
      const mockAnonymousConvs = [
        { id: 'anon-1', title: 'Conv 1', created_at: '2025-01-01', updated_at: '2025-01-01', messages: [] },
      ]

      vi.mocked(storage.getAnonymousConversations).mockReturnValue(mockAnonymousConvs)
      vi.mocked(storage.getCurrentAnonymousId).mockReturnValue('') // Sin ID guardado

      const { result } = renderHook(() => useConversations(false))

      await waitFor(() => {
        expect(result.current.currentConversationId).toBe('anon-1')
      })

      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('anon-1')
    })
  })

  describe('Manejo de errores', () => {
    it('debe limpiar estado si hay error de autenticación 401', async () => {
      const error = new Error('401 Unauthorized')
      vi.mocked(conversationsApi.getConversations).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(0)
      })

      expect(storage.clearAnonymousConversations).toHaveBeenCalled()
      expect(storage.setCurrentAnonymousId).toHaveBeenCalledWith('')
      expect(result.current.currentConversationId).toBeNull()
    })

    it('debe propagar error al eliminar conversación', async () => {
      const mockConversations = [
        { id: '1', title: 'Conv 1', created_at: '2025-01-01', updated_at: '2025-01-01' },
      ]

      vi.mocked(conversationsApi.getConversations).mockResolvedValueOnce(mockConversations)
      vi.mocked(conversationsApi.deleteConversation).mockRejectedValueOnce(new Error('Delete failed'))

      const { result } = renderHook(() => useConversations(true))

      await waitFor(() => {
        expect(result.current.conversations).toHaveLength(1)
      })

      await expect(async () => {
        await act(async () => {
          await result.current.deleteConversation('1')
        })
      }).rejects.toThrow('Delete failed')
    })
  })
})