import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAnonymousChat } from '@/hooks/chat/useAnonymousChat'
import { storage } from '@/lib/storage'

// Mock del módulo storage
vi.mock('@/lib/storage', () => ({
  storage: {
    getMessageCount: vi.fn(),
    getAnonymousConversations: vi.fn(),
    incrementMessageCount: vi.fn(),
    incrementConversationCount: vi.fn(),
    getRemainingMessages: vi.fn(),
    getRemainingConversations: vi.fn(),
    resetMessageCount: vi.fn(),
  },
}))

describe('useAnonymousChat - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup valores por defecto
    vi.mocked(storage.getMessageCount).mockReturnValue(0)
    vi.mocked(storage.getAnonymousConversations).mockReturnValue([])
    vi.mocked(storage.getRemainingMessages).mockReturnValue(15)
    vi.mocked(storage.getRemainingConversations).mockReturnValue(3)
  })

  describe('Inicialización', () => {
    it('debe cargar contadores desde storage al montar', async () => {
      vi.mocked(storage.getMessageCount).mockReturnValue(5)
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([
        { id: '1', title: 'Test', created_at: '', updated_at: '', messages: [] },
        { id: '2', title: 'Test 2', created_at: '', updated_at: '', messages: [] },
      ])

      const { result } = renderHook(() => useAnonymousChat())

      // Esperar a que el useEffect se ejecute
      await waitFor(() => {
        expect(result.current.messageCount).toBe(5)
      })

      expect(result.current.conversationCount).toBe(2)
      expect(result.current.showLimitModal).toBe(false)
      expect(storage.getMessageCount).toHaveBeenCalled()
      expect(storage.getAnonymousConversations).toHaveBeenCalled()
    })

    it('debe inicializar con modal cerrado', async () => {
      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(0)
      })

      expect(result.current.showLimitModal).toBe(false)
    })

    it('debe calcular límites booleanos correctamente', async () => {
      vi.mocked(storage.getMessageCount).mockReturnValue(10)
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([
        { id: '1', title: 'Test', created_at: '', updated_at: '', messages: [] },
      ])

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(10)
      })

      expect(result.current.hasReachedMessageLimit).toBe(false)
      expect(result.current.hasReachedConversationLimit).toBe(false)
    })
  })

  describe('Incremento de mensajes', () => {
    it('debe incrementar contador y actualizar estado', async () => {
      vi.mocked(storage.getMessageCount)
        .mockReturnValueOnce(5)  // Inicial
        .mockReturnValueOnce(6)  // Después de incrementar

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(5)
      })

      let canContinue: boolean = false

      act(() => {
        canContinue = result.current.incrementMessageCount()
      })

      expect(storage.incrementMessageCount).toHaveBeenCalled()
      expect(result.current.messageCount).toBe(6)
      expect(canContinue).toBe(true)
      expect(result.current.showLimitModal).toBe(false)
    })

    it('debe bloquear y mostrar modal al alcanzar límite de 15 mensajes', async () => {
      vi.mocked(storage.getMessageCount)
        .mockReturnValueOnce(14)  // Inicial
        .mockReturnValueOnce(15)  // Después de incrementar

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(14)
      })

      let canContinue: boolean = false

      act(() => {
        canContinue = result.current.incrementMessageCount()
      })

      expect(storage.incrementMessageCount).toHaveBeenCalled()
      expect(result.current.messageCount).toBe(15)
      expect(canContinue).toBe(false)
      expect(result.current.showLimitModal).toBe(true)
      expect(result.current.hasReachedMessageLimit).toBe(true)
    })

    it('debe retornar true si mounted es false', async () => {
      const { result } = renderHook(() => useAnonymousChat())

      // Llamar inmediatamente antes de que mounted se active
      let canContinue: boolean = false

      act(() => {
        canContinue = result.current.incrementMessageCount()
      })

      // Debe retornar true como fallback
      expect(canContinue).toBe(true)
    })
  })

  describe('Límite de conversaciones', () => {
    it('debe permitir crear conversación si no alcanzó el límite', async () => {
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([
        { id: '1', title: 'Test 1', created_at: '', updated_at: '', messages: [] },
        { id: '2', title: 'Test 2', created_at: '', updated_at: '', messages: [] },
      ])

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.conversationCount).toBe(2)
      })

      let canCreate: boolean = false

      act(() => {
        canCreate = result.current.checkConversationLimit()
      })

      expect(canCreate).toBe(true)
      expect(result.current.showLimitModal).toBe(false)
    })

    it('debe bloquear y mostrar modal al alcanzar límite de 3 conversaciones', async () => {
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([
        { id: '1', title: 'Test 1', created_at: '', updated_at: '', messages: [] },
        { id: '2', title: 'Test 2', created_at: '', updated_at: '', messages: [] },
        { id: '3', title: 'Test 3', created_at: '', updated_at: '', messages: [] },
      ])

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.conversationCount).toBe(3)
      })

      let canCreate: boolean = false

      act(() => {
        canCreate = result.current.checkConversationLimit()
      })

      expect(canCreate).toBe(false)
      expect(result.current.showLimitModal).toBe(true)
      expect(result.current.hasReachedConversationLimit).toBe(true)
    })

    it('debe incrementar contador de conversaciones', async () => {
      vi.mocked(storage.getAnonymousConversations)
        .mockReturnValueOnce([
          { id: '1', title: 'Test', created_at: '', updated_at: '', messages: [] },
        ])
        .mockReturnValueOnce([
          { id: '1', title: 'Test', created_at: '', updated_at: '', messages: [] },
          { id: '2', title: 'Test 2', created_at: '', updated_at: '', messages: [] },
        ])

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.conversationCount).toBe(1)
      })

      act(() => {
        result.current.incrementConversationCount()
      })

      expect(storage.incrementConversationCount).toHaveBeenCalled()
      expect(result.current.conversationCount).toBe(2)
    })
  })

  describe('Reset de límites', () => {
    it('debe resetear contador de mensajes y cerrar modal', async () => {
      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(0)
      })

      // Activar modal manualmente
      act(() => {
        result.current.setShowLimitModal(true)
      })

      expect(result.current.showLimitModal).toBe(true)

      // Resetear
      act(() => {
        result.current.resetLimits()
      })

      expect(storage.resetMessageCount).toHaveBeenCalled()
      expect(result.current.messageCount).toBe(0)
      expect(result.current.showLimitModal).toBe(false)
    })
  })

  describe('Control del modal', () => {
    it('debe poder cerrar modal manualmente', async () => {
      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(0)
      })

      // Abrir modal manualmente
      act(() => {
        result.current.setShowLimitModal(true)
      })

      expect(result.current.showLimitModal).toBe(true)

      // Cerrar modal manualmente
      act(() => {
        result.current.setShowLimitModal(false)
      })

      expect(result.current.showLimitModal).toBe(false)
    })
  })

  describe('Valores calculados', () => {
    it('debe retornar remainingMessages desde storage', async () => {
      vi.mocked(storage.getRemainingMessages).mockReturnValue(10)

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(0)
      })

      expect(result.current.remainingMessages).toBe(10)
    })

    it('debe retornar remainingConversations desde storage', async () => {
      vi.mocked(storage.getRemainingConversations).mockReturnValue(2)

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(0)
      })

      expect(result.current.remainingConversations).toBe(2)
    })

    it('debe calcular hasReachedMessageLimit correctamente', async () => {
      vi.mocked(storage.getMessageCount).mockReturnValue(15)

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.messageCount).toBe(15)
      })

      expect(result.current.hasReachedMessageLimit).toBe(true)
    })

    it('debe calcular hasReachedConversationLimit correctamente', async () => {
      vi.mocked(storage.getAnonymousConversations).mockReturnValue([
        { id: '1', title: 'Test 1', created_at: '', updated_at: '', messages: [] },
        { id: '2', title: 'Test 2', created_at: '', updated_at: '', messages: [] },
        { id: '3', title: 'Test 3', created_at: '', updated_at: '', messages: [] },
      ])

      const { result } = renderHook(() => useAnonymousChat())

      await waitFor(() => {
        expect(result.current.conversationCount).toBe(3)
      })

      expect(result.current.hasReachedConversationLimit).toBe(true)
    })
  })
})