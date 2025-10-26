import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { conversations } from '@/lib/api/conversations'

global.fetch = vi.fn()

describe('conversations - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Obtener conversaciones', () => {
    it('debe obtener lista de conversaciones', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockConversations = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          created_at: '2025-01-01',
          updated_at: '2025-01-01',
        },
        {
          id: 'conv-2',
          title: 'Chat 2',
          created_at: '2025-01-02',
          updated_at: '2025-01-02',
        },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      } as Response)

      const result = await conversations.getConversations()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/conversations',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
      expect(result).toEqual(mockConversations)
    })

    it('debe manejar respuesta sin wrapper conversations', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockData = [
        { id: 'conv-1', title: 'Chat 1' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await conversations.getConversations()

      expect(result).toEqual(mockData)
    })

    it('debe lanzar error si falla la petición', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response)

      await expect(conversations.getConversations()).rejects.toThrow('Server error')
    })

    it('debe retornar array vacío si no hay conversaciones', async () => {
      localStorage.setItem('access_token', 'test-token')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: [] }),
      } as Response)

      const result = await conversations.getConversations()

      expect(result).toEqual([])
    })
  })

  describe('Crear conversación', () => {
    it('debe crear nueva conversación', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockConversation = {
        id: 'conv-new',
        title: 'Nueva conversación',
        created_at: '2025-01-10',
        updated_at: '2025-01-10',
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversation: mockConversation }),
      } as Response)

      const result = await conversations.createConversation('Nueva conversación')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/conversations',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title: 'Nueva conversación' }),
        })
      )
      expect(result).toEqual(mockConversation)
    })

    it('debe manejar respuesta sin wrapper conversation', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockData = { id: 'conv-new', title: 'Test' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await conversations.createConversation('Test')

      expect(result).toEqual(mockData)
    })

    it('debe lanzar error al crear conversación duplicada', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Conversación ya existe' }),
      } as Response)

      await expect(
        conversations.createConversation('Duplicada')
      ).rejects.toThrow('Conversación ya existe')
    })
  })

  describe('Eliminar conversación', () => {
    it('debe eliminar conversación existente', async () => {
      localStorage.setItem('access_token', 'test-token')

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)

      await conversations.deleteConversation('conv-123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/conversations/conv-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('debe lanzar error al eliminar conversación inexistente', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Conversación no encontrada' }),
      } as Response)

      await expect(
        conversations.deleteConversation('conv-inexistente')
      ).rejects.toThrow('Conversación no encontrada')
    })

    it('debe lanzar error si no está autorizado', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'No autorizado' }),
      } as Response)

      await expect(
        conversations.deleteConversation('conv-123')
      ).rejects.toThrow('No autorizado')
    })
  })

  describe('Actualizar título de conversación', () => {
    it('debe actualizar título correctamente', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockUpdated = {
        id: 'conv-123',
        title: 'Título actualizado',
        created_at: '2025-01-01',
        updated_at: '2025-01-10',
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversation: mockUpdated }),
      } as Response)

      const result = await conversations.updateConversationTitle(
        'conv-123',
        'Título actualizado'
      )

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/conversations/conv-123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ title: 'Título actualizado' }),
        })
      )
      expect(result).toEqual(mockUpdated)
    })

    it('debe manejar respuesta sin wrapper conversation', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockData = { id: 'conv-123', title: 'Nuevo título' }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await conversations.updateConversationTitle('conv-123', 'Nuevo título')

      expect(result).toEqual(mockData)
    })

    it('debe lanzar error con título vacío', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Título no puede estar vacío' }),
      } as Response)

      await expect(
        conversations.updateConversationTitle('conv-123', '')
      ).rejects.toThrow('Título no puede estar vacío')
    })
  })

  describe('Obtener mensajes de conversación', () => {
    it('debe obtener mensajes de conversación existente', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockMessages = [
        { sender: 'user', text: 'Hola' },
        { sender: 'bot', text: '¿Cómo estás?' },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      } as Response)

      const result = await conversations.getMessages('conv-123')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/conversations/conv-123/messages',
        expect.objectContaining({
          method: 'GET',
        })
      )
      expect(result).toEqual(mockMessages)
    })

    it('debe manejar respuesta sin wrapper messages', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockData = [{ sender: 'user', text: 'Test' }]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await conversations.getMessages('conv-123')

      expect(result).toEqual(mockData)
    })

    it('debe retornar array vacío si conversación no existe (404)', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'Error 404' }),
        } as Response)

        const result = await conversations.getMessages('conv-inexistente')

        expect(result).toEqual([])
    })

    it('debe lanzar error en otros casos de error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      } as Response)

      await expect(
        conversations.getMessages('conv-123')
      ).rejects.toThrow('Server error')
    })

    it('debe obtener mensajes con archivos adjuntos', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockMessages = [
        {
          sender: 'user',
          text: 'Mira este archivo',
          file_url: 'https://example.com/file.pdf',
          file_name: 'document.pdf',
          file_type: 'application/pdf',
          file_size: 1024,
        },
      ]

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      } as Response)

      const result = await conversations.getMessages('conv-123')

      expect(result[0]).toHaveProperty('file_url')
      expect(result[0].file_name).toBe('document.pdf')
    })
  })
})