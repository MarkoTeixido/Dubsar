import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/chat/useChat'
import { conversations } from '@/lib/api/conversations'
import { storage } from '@/lib/storage'
import { chat } from '@/lib/api/chat'

// Mock de APIs
vi.mock('@/lib/api/conversations', () => ({
  conversations: {
    getMessages: vi.fn(),
  },
}))

vi.mock('@/lib/api/files', () => ({
  files: {
    uploadFile: vi.fn(),
  },
}))

vi.mock('@/lib/api/chat', () => ({
  chat: {
    sendMessage: vi.fn(),
  },
}))

vi.mock('@/lib/storage', () => ({
  storage: {
    getAnonymousConversation: vi.fn(),
    saveAnonymousConversation: vi.fn(),
    uploadAnonymousFile: vi.fn(),
  },
}))

// ⚡ Helper para esperar que terminen los timeouts del streaming
const waitForStreamingToComplete = () => {
  return new Promise(resolve => setTimeout(resolve, 100))
}

describe('useChat - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock de clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  // ⚡ Esperar a que terminen los timeouts después de cada test
  afterEach(async () => {
    await waitForStreamingToComplete()
  })

  describe('Carga de mensajes desde API', () => {
    it('debe cargar mensajes existentes para usuario autenticado', async () => {
      const mockMessages = [
        { sender: 'user', text: 'Hola' },
        { sender: 'bot', text: 'Hola, ¿cómo estás?' },
      ]

      vi.mocked(conversations.getMessages).mockResolvedValueOnce(mockMessages)

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2)
      }, { timeout: 3000 })

      expect(conversations.getMessages).toHaveBeenCalledWith('conv-123')
      expect(result.current.messages[0].text).toBe('Hola')
      expect(result.current.messages[1].text).toBe('Hola, ¿cómo estás?')
    })

    it('debe cargar mensajes con archivos adjuntos desde API', async () => {
      const mockMessages = [
        {
          sender: 'user',
          text: 'Mira esta imagen',
          file_url: 'https://example.com/image.jpg',
          file_name: 'image.jpg',
          file_type: 'image/jpeg',
          file_size: 1024,
        },
      ]

      vi.mocked(conversations.getMessages).mockResolvedValueOnce(mockMessages)

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1)
      }, { timeout: 3000 })

      expect(result.current.messages[0].fileUrl).toBe('https://example.com/image.jpg')
      expect(result.current.messages[0].fileName).toBe('image.jpg')
      expect(result.current.messages[0].fileType).toBe('image/jpeg')
      expect(result.current.messages[0].fileSize).toBe(1024)
    })

    it('debe mostrar mensaje de bienvenida si conversación está vacía', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([])

      const { result } = renderHook(() =>
        useChat('conv-123', true, 'Test User')
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
        expect(result.current.messages[0].sender).toBe('bot')
        expect(result.current.messages[0].text.length).toBeGreaterThan(10)
      }, { timeout: 5000 })

      expect(result.current.messages[0].text).toContain('Hola')
    })

    it('debe manejar errores de red al cargar mensajes', async () => {
      vi.mocked(conversations.getMessages).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() =>
        useChat('conv-123', true, 'Test User')
      )

      // Debe mostrar mensaje de bienvenida como fallback
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
        expect(result.current.messages[0].sender).toBe('bot')
      }, { timeout: 5000 })
    })
  })

  describe('Carga de mensajes desde localStorage (anónimos)', () => {
    it('debe cargar mensajes de conversación anónima', async () => {
      const mockConv = {
        id: 'anon-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [
          { sender: 'user' as const, text: 'Hola', timestamp: '2025-01-01' },
          { sender: 'bot' as const, text: '¿Cómo estás?', timestamp: '2025-01-01' },
        ],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValueOnce(mockConv)

      const { result } = renderHook(() =>
        useChat('anon-123', false)
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2)
      }, { timeout: 3000 })

      expect(storage.getAnonymousConversation).toHaveBeenCalledWith('anon-123')
      expect(result.current.messages[0].text).toBe('Hola')
    })

    it('debe cargar archivos de mensajes anónimos desde localStorage', async () => {
      const mockConv = {
        id: 'anon-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [
          {
            sender: 'user' as const,
            text: 'Test',
            timestamp: '2025-01-01',
            fileUrl: 'data:image/png;base64,abc',
            fileName: 'test.png',
            fileType: 'image/png',
            fileSize: 500,
          },
        ],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValueOnce(mockConv)

      const { result } = renderHook(() =>
        useChat('anon-123', false)
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1)
      }, { timeout: 3000 })

      expect(result.current.messages[0].fileUrl).toBe('data:image/png;base64,abc')
    })

    it('debe limpiar datos anónimos al detectar login', async () => {
      const { result } = renderHook(() =>
        useChat('anon_123', true, 'Test User')
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      // No debe llamar a API para IDs anónimos después de login
      expect(conversations.getMessages).not.toHaveBeenCalled()
      expect(result.current.messages[0].sender).toBe('bot')
    })
  })

  describe('Mensaje de bienvenida con streaming', () => {
    it('debe mostrar mensaje personalizado con nombre de usuario', async () => {
      const { result } = renderHook(() =>
        useChat(null, false, 'John Doe')
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
        expect(result.current.messages[0].sender).toBe('bot')
        expect(result.current.messages[0].text.length).toBeGreaterThan(10)
      }, { timeout: 5000 })

      const text = result.current.messages[0].text
      expect(text).toContain('Hola')
      expect(text).toContain('John')
    })

    it('debe mostrar mensaje genérico sin nombre de usuario', async () => {
      const { result } = renderHook(() =>
        useChat(null, false, undefined)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
        expect(result.current.messages[0].text.length).toBeGreaterThan(10)
      }, { timeout: 5000 })

      expect(result.current.messages[0].sender).toBe('bot')
      expect(result.current.messages[0].text).toContain('Hola')
    })
  })

  describe('Envío de mensajes con streaming', () => {
    it('debe enviar mensaje, iniciar streaming y actualizar estado', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Hola"}\n\n'))
          controller.enqueue(new TextEncoder().encode('data: {"done":true}\n\n'))
          controller.close()
        },
      })

      vi.mocked(chat.sendMessage).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      } as Response)

      vi.mocked(conversations.getMessages).mockResolvedValueOnce([])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      act(() => {
        result.current.setInput('Test message')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        expect(chat.sendMessage).toHaveBeenCalled()
      }, { timeout: 2000 })

      expect(result.current.input).toBe('')
    })

    it('no debe enviar si input está vacío', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      const initialLength = result.current.messages.length

      await act(async () => {
        await result.current.sendMessage()
      })

      expect(result.current.messages).toHaveLength(initialLength)
      expect(chat.sendMessage).not.toHaveBeenCalled()
    })

    it('no debe enviar si no hay conversationId', async () => {
      const { result } = renderHook(() =>
        useChat(null, true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      act(() => {
        result.current.setInput('Test')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      expect(chat.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('Límites de mensajes para usuarios anónimos', () => {
    it('debe bloquear envío cuando se alcanza el límite', async () => {
      const mockOnMessageSent = vi.fn(() => false)

      const { result } = renderHook(() =>
        useChat('anon-123', false, undefined, mockOnMessageSent)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      act(() => {
        result.current.setInput('Test')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      expect(mockOnMessageSent).toHaveBeenCalled()
      expect(chat.sendMessage).not.toHaveBeenCalled()
    })

    it('debe permitir envío cuando no se alcanza el límite', async () => {
      const mockOnMessageSent = vi.fn(() => true)

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

      const mockConv = {
        id: 'anon-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValue(mockConv)

      const { result } = renderHook(() =>
        useChat('anon-123', false, undefined, mockOnMessageSent)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      act(() => {
        result.current.setInput('Test')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      expect(mockOnMessageSent).toHaveBeenCalled()
      await waitFor(() => {
        expect(chat.sendMessage).toHaveBeenCalled()
      }, { timeout: 2000 })
    })
  })

  describe('Cambio de conversación', () => {
    it('debe cargar nuevos mensajes al cambiar conversationId', async () => {
      vi.mocked(conversations.getMessages)
        .mockResolvedValueOnce([{ sender: 'user', text: 'Msg 1' }])
        .mockResolvedValueOnce([{ sender: 'user', text: 'Msg 2' }])

      const { result, rerender } = renderHook(
        ({ convId }) => useChat(convId, true),
        { initialProps: { convId: 'conv-1' } }
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1)
      }, { timeout: 3000 })

      expect(result.current.messages[0].text).toBe('Msg 1')

      rerender({ convId: 'conv-2' })

      await waitFor(() => {
        expect(result.current.messages[0].text).toBe('Msg 2')
      }, { timeout: 3000 })
    })

    it('debe cambiar de localStorage a API al autenticarse', async () => {
      const mockConv = {
        id: 'conv-123',
        title: 'Test',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        messages: [{ sender: 'user' as const, text: 'Anon', timestamp: '2025-01-01' }],
      }

      vi.mocked(storage.getAnonymousConversation).mockReturnValue(mockConv)
      vi.mocked(conversations.getMessages).mockResolvedValue([
        { sender: 'user', text: 'Auth' },
      ])

      const { result, rerender } = renderHook(
        ({ auth }) => useChat('conv-123', auth),
        { initialProps: { auth: false } }
      )

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1)
      }, { timeout: 3000 })

      rerender({ auth: true })

      await waitFor(() => {
        expect(conversations.getMessages).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })
})