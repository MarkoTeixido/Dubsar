import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStreaming } from '@/hooks/chat/useChatStreaming'
import { chat } from '@/lib/api/chat'
import { storage } from '@/lib/storage'

vi.mock('@/lib/api/chat', () => ({
  chat: {
    sendMessage: vi.fn(),
  },
}))

vi.mock('@/lib/storage', () => ({
  storage: {
    getAnonymousConversation: vi.fn(),
    saveAnonymousConversation: vi.fn(),
  },
}))

describe('useChatStreaming - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Streaming de respuestas con SSE', () => {
    it('debe procesar stream completo y concatenar chunks', async () => {
      const onStart = vi.fn()
      const onChunk = vi.fn()
      const onComplete = vi.fn()
      const onError = vi.fn()

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Hola"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"chunk":" mundo"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart,
          onChunk,
          onComplete,
          onError,
        })
      })

      // Verificar flujo completo
      expect(onStart).toHaveBeenCalled()
      expect(onChunk).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalledWith('Hola mundo')
      expect(onError).not.toHaveBeenCalled()
    })

    it('debe llamar onChunk por cada fragmento recibido', async () => {
      const onChunk = vi.fn()
      const onComplete = vi.fn()

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"A"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"B"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"C"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk,
          onComplete,
          onError: vi.fn(),
        })
      })

      expect(onChunk).toHaveBeenCalledTimes(3)
      expect(onComplete).toHaveBeenCalledWith('ABC')
    })

    it('debe manejar chunks fragmentados correctamente', async () => {
      const onChunk = vi.fn()

      const mockStream = new ReadableStream({
        start(controller) {
          // Simular chunk fragmentado en múltiples partes
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Part1'))
          controller.enqueue(new TextEncoder().encode('"}\n\ndata: {"chunk":"Part2"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk,
          onComplete: vi.fn(),
          onError: vi.fn(),
        })
      })

      expect(onChunk).toHaveBeenCalled()
    })
  })

  describe('Persistencia de mensajes anónimos', () => {
    it('debe guardar mensaje de usuario antes de streaming', async () => {
      const mockConv = {
        id: 'anon-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValue(mockConv)

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Test"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'anon-123',
          userMessage: { sender: 'user', text: 'Hello' },
          isAuthenticated: false,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError: vi.fn(),
        })
      })

      // Debería guardar 2 veces: mensaje usuario + respuesta bot
      expect(storage.saveAnonymousConversation).toHaveBeenCalledTimes(2)
    })

    it('debe guardar archivos adjuntos en mensaje de usuario', async () => {
      const mockConv = {
        id: 'anon-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValue(mockConv)

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Ok"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const fileData = {
        url: 'https://example.com/file.pdf',
        name: 'file.pdf',
        type: 'application/pdf',
        size: 1024,
        category: 'document' as const,
      }

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'anon-123',
          userMessage: { sender: 'user', text: 'Check this' },
          isAuthenticated: false,
          fileData,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError: vi.fn(),
        })
      })

      const savedCall = vi.mocked(storage.saveAnonymousConversation).mock.calls[0][0]
      expect(savedCall.messages[0].fileUrl).toBe('https://example.com/file.pdf')
      expect(savedCall.messages[0].fileName).toBe('file.pdf')
    })

    it('no debe guardar si conversación anónima no existe', async () => {
      vi.mocked(storage.getAnonymousConversation).mockReturnValue(null)

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Ok"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'anon-999',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: false,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError: vi.fn(),
        })
      })

      expect(storage.saveAnonymousConversation).not.toHaveBeenCalled()
    })
  })

  describe('Manejo de errores del servidor', () => {
    it('debe llamar onError cuando servidor retorna status 500', async () => {
      const onError = vi.fn()

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError,
        })
      })

      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0]).toContain('Error')
      expect(onError.mock.calls[0][0]).toContain('500')
    })

    it('debe llamar onError cuando respuesta no tiene body', async () => {
      const onError = vi.fn()

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: null,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError,
        })
      })

      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0]).toContain('stream')
    })

    it('debe llamar onError cuando hay error de red', async () => {
      const onError = vi.fn()

      vi.mocked(chat.sendMessage).mockRejectedValueOnce(new Error('Failed to fetch'))

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete: vi.fn(),
          onError,
        })
      })

      expect(onError).toHaveBeenCalled()
      expect(onError.mock.calls[0][0]).toContain('backend')
    })
  })

  describe('Manejo de errores en parsing de SSE', () => {
    it('debe ignorar chunks con JSON inválido', async () => {
      const onError = vi.fn()
      const onComplete = vi.fn()

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {invalid json}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete,
          onError,
        })
      })

      // No debería crashear, solo loguear error
      // onComplete se llama cuando llega "done"
      expect(onComplete).toHaveBeenCalled()
      expect(onError).not.toHaveBeenCalled()
    })

    it('debe lanzar excepción cuando chunk contiene error', async () => {
      const onComplete = vi.fn()

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"error":"Server error"}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      const { result } = renderHook(() => useChatStreaming())

      await act(async () => {
        await result.current.startStreaming({
          conversationId: 'conv-123',
          userMessage: { sender: 'user', text: 'Test' },
          isAuthenticated: true,
          fileData: null,
          onStart: vi.fn(),
          onChunk: vi.fn(),
          onComplete,
          onError: vi.fn(),
        })
      })

      // onComplete NO se llama porque hubo error antes de "done"
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})