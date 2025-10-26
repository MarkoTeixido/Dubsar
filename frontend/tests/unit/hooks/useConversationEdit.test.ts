import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConversationEdit } from '@/hooks/conversations/useConversationEdit'
import type { Conversation } from '@/hooks/conversations/useConversations'

describe('useConversationEdit', () => {
  const mockConversations: Conversation[] = [
    {
      id: '1',
      title: 'Conversación 1',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
    {
      id: '2',
      title: 'Conversación 2',
      created_at: '2025-01-02',
      updated_at: '2025-01-02',
    },
  ]

  let mockUpdateTitle: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockUpdateTitle = vi.fn()
  })

  it('debe inicializar sin modo edición', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    expect(result.current.editingId).toBe(null)
    expect(result.current.editTitle).toBe('')
  })

  it('debe iniciar edición de conversación', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    expect(result.current.editingId).toBe('1')
    expect(result.current.editTitle).toBe('Conversación 1')
  })

  it('debe actualizar el título mientras edita', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    act(() => {
      result.current.setEditTitle('Nuevo título')
    })

    expect(result.current.editTitle).toBe('Nuevo título')
  })

  it('debe guardar título modificado', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    act(() => {
      result.current.setEditTitle('Título modificado')
    })

    act(() => {
      result.current.saveTitle('1')
    })

    expect(mockUpdateTitle).toHaveBeenCalledWith('1', 'Título modificado')
    expect(result.current.editingId).toBe(null)
    expect(result.current.editTitle).toBe('')
  })

  it('no debe guardar si el título no cambió', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    // NO modificar el título, solo guardar
    act(() => {
      result.current.saveTitle('1')
    })

    expect(mockUpdateTitle).not.toHaveBeenCalled()
    expect(result.current.editingId).toBe(null)
  })

  it('no debe guardar si el título está vacío', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    act(() => {
      result.current.setEditTitle('   ')
    })

    act(() => {
      result.current.saveTitle('1')
    })

    expect(mockUpdateTitle).not.toHaveBeenCalled()
  })

  it('debe cancelar edición', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    act(() => {
      result.current.setEditTitle('Título temporal')
    })

    act(() => {
      result.current.cancelEditing()
    })

    expect(result.current.editingId).toBe(null)
    expect(result.current.editTitle).toBe('')
    expect(mockUpdateTitle).not.toHaveBeenCalled()
  })

  it('debe recortar espacios al guardar', () => {
    const { result } = renderHook(() =>
      useConversationEdit(mockConversations, mockUpdateTitle)
    )

    act(() => {
      result.current.startEditing(mockConversations[0])
    })

    act(() => {
      result.current.setEditTitle('  Título con espacios  ')
    })

    act(() => {
      result.current.saveTitle('1')
    })

    expect(mockUpdateTitle).toHaveBeenCalledWith('1', 'Título con espacios')
  })
})