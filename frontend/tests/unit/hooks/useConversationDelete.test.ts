import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConversationDelete } from '@/hooks/conversations/useConversationDelete'

describe('useConversationDelete', () => {
  let mockDeleteConversation: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockDeleteConversation = vi.fn()
  })

  it('debe inicializar con dialog cerrado', () => {
    const { result } = renderHook(() =>
      useConversationDelete(mockDeleteConversation)
    )

    expect(result.current.deleteDialogOpen).toBe(false)
  })

  it('debe abrir dialog al hacer click en delete', () => {
    const { result } = renderHook(() =>
      useConversationDelete(mockDeleteConversation)
    )

    act(() => {
      result.current.handleDeleteClick('conversation-123')
    })

    expect(result.current.deleteDialogOpen).toBe(true)
  })

  it('debe llamar a delete al confirmar', () => {
    const { result } = renderHook(() =>
      useConversationDelete(mockDeleteConversation)
    )

    act(() => {
      result.current.handleDeleteClick('conversation-123')
    })

    act(() => {
      result.current.confirmDelete()
    })

    expect(mockDeleteConversation).toHaveBeenCalledWith('conversation-123')
    expect(result.current.deleteDialogOpen).toBe(false)
  })

  it('no debe llamar a delete al cancelar', () => {
    const { result } = renderHook(() =>
      useConversationDelete(mockDeleteConversation)
    )

    act(() => {
      result.current.handleDeleteClick('conversation-123')
    })

    // Resetear mock para verificar que NO se llama después de cancelar
    mockDeleteConversation.mockClear()

    act(() => {
      result.current.cancelDelete()
    })

    expect(mockDeleteConversation).not.toHaveBeenCalled()
    expect(result.current.deleteDialogOpen).toBe(false)
  })

  it('debe poder cambiar estado del dialog manualmente', () => {
    const { result } = renderHook(() =>
      useConversationDelete(mockDeleteConversation)
    )

    act(() => {
      result.current.setDeleteDialogOpen(true)
    })

    expect(result.current.deleteDialogOpen).toBe(true)

    act(() => {
      result.current.setDeleteDialogOpen(false)
    })

    expect(result.current.deleteDialogOpen).toBe(false)
  })
})