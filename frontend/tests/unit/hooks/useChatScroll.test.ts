import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChatScroll } from '@/hooks/chat/useChatScroll'
import type { Message } from '@/types/chat'

describe('useChatScroll', () => {
  it('debe inicializar con messagesEndRef', () => {
    const { result } = renderHook(() => useChatScroll([]))

    expect(result.current.messagesEndRef).toBeDefined()
    expect(result.current.messagesEndRef.current).toBeNull()
  })

  it('debe tener referencia válida', () => {
    const messages: Message[] = [
      { sender: 'user', text: 'Hola' },
      { sender: 'bot', text: '¿Cómo estás?' },
    ]

    const { result } = renderHook(() => useChatScroll(messages))

    expect(result.current.messagesEndRef).toBeDefined()
    expect(typeof result.current.messagesEndRef).toBe('object')
  })

  it('debe actualizar cuando cambian los mensajes', () => {
    const messages1: Message[] = [{ sender: 'user', text: 'Hola' }]
    const messages2: Message[] = [
      { sender: 'user', text: 'Hola' },
      { sender: 'bot', text: '¿Cómo estás?' },
    ]

    const { result, rerender } = renderHook(
      ({ messages }) => useChatScroll(messages),
      { initialProps: { messages: messages1 } }
    )

    const initialRef = result.current.messagesEndRef

    rerender({ messages: messages2 })

    expect(result.current.messagesEndRef).toBe(initialRef)
  })
})