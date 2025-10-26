import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/chat/useChat'
import { conversations } from '@/lib/api/conversations'

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

describe('useChat - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([{ sender: 'bot', text: 'Hola' }])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 2000 })

      expect(result.current.input).toBe('')
      expect(result.current.loading).toBe(false)
      expect(result.current.copiedIndex).toBeNull()
      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })

    it('debe exponer API pública correcta', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 5000 })

      expect(typeof result.current.setInput).toBe('function')
      expect(typeof result.current.sendMessage).toBe('function')
      expect(typeof result.current.copyToClipboard).toBe('function')
      expect(typeof result.current.handleFileSelect).toBe('function')
      expect(typeof result.current.handleRemoveFile).toBe('function')
    })
  })

  describe('Manejo de input', () => {
    it('debe actualizar input con setInput', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([{ sender: 'bot', text: 'Hola' }])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 2000 })

      act(() => {
        result.current.setInput('Nuevo mensaje')
      })

      expect(result.current.input).toBe('Nuevo mensaje')
    })
  })

  describe('Copiar al portapapeles', () => {
    it('debe copiar texto y actualizar copiedIndex', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([
        { sender: 'bot', text: 'Test message' },
      ])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 2000 })

      act(() => {
        result.current.copyToClipboard('Test text', 0)
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test text')
      expect(result.current.copiedIndex).toBe(0)
    })

    it('debe resetear copiedIndex después de 2 segundos', async () => {
      vi.mocked(conversations.getMessages).mockResolvedValueOnce([
        { sender: 'bot', text: 'Test' },
      ])

      const { result } = renderHook(() =>
        useChat('conv-123', true)
      )

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      }, { timeout: 2000 })

      act(() => {
        result.current.copyToClipboard('Test', 5)
      })

      expect(result.current.copiedIndex).toBe(5)

      await waitFor(() => {
        expect(result.current.copiedIndex).toBeNull()
      }, { timeout: 2500 })
    })
  })
})