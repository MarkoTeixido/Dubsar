import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { chat } from '@/lib/api/chat'

global.fetch = vi.fn()

describe('chat - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Envío de mensajes', () => {
    it('debe enviar mensaje sin archivo', async () => {
      const mockStream = new ReadableStream()

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(mockStream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
      )

      const result = await chat.sendMessage('conv-123', 'Hola')

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/chat/stream',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            message: 'Hola',
            conversationId: 'conv-123',
            fileData: undefined,
          }),
        })
      )
      expect(result).toBeInstanceOf(Response)
    })

    it('debe enviar mensaje con archivo adjunto', async () => {
      localStorage.setItem('access_token', 'test-token')

      const mockStream = new ReadableStream()
      const fileData = {
        url: 'https://example.com/file.pdf',
        name: 'document.pdf',
        type: 'application/pdf',
        size: 1024,
        category: 'document',
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(mockStream, { status: 200 })
      )

      const result = await chat.sendMessage('conv-123', 'Mira este archivo', fileData)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/chat/stream',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({
            message: 'Mira este archivo',
            conversationId: 'conv-123',
            fileData,
          }),
        })
      )
      expect(result).toBeInstanceOf(Response)
    })

    it('debe enviar mensaje con fileData null', async () => {
      const mockStream = new ReadableStream()

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(mockStream, { status: 200 })
      )

      await chat.sendMessage('conv-123', 'Test', null)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/chat/stream',
        expect.objectContaining({
          body: JSON.stringify({
            message: 'Test',
            conversationId: 'conv-123',
            fileData: null,
          }),
        })
      )
    })

    it('debe retornar Response para streaming', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"chunk":"Hola"}\n\n'))
          controller.close()
        },
      })

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(mockStream, { status: 200 })
      )

      const response = await chat.sendMessage('conv-123', 'Test')

      expect(response.ok).toBe(true)
      expect(response.body).toBeDefined()
    })
  })
})