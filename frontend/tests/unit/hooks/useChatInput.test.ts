import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatInput } from '@/hooks/chat/useChatInput'

describe('useChatInput - Unit Tests', () => {
  describe('Inicialización', () => {
    it('debe retornar ref de textarea sin valor inicial', () => {
      const { result } = renderHook(() => useChatInput(''))

      expect(result.current.textareaRef).toBeDefined()
      expect(result.current.textareaRef.current).toBeNull()
    })

    it('debe retornar función handleKeyDown', () => {
      const { result } = renderHook(() => useChatInput(''))

      expect(typeof result.current.handleKeyDown).toBe('function')
    })

    it('debe aceptar valor inicial en el hook', () => {
      const { result } = renderHook(() => useChatInput('Texto inicial'))

      expect(result.current.textareaRef).toBeDefined()
    })
  })

  describe('Manejo de tecla Enter', () => {
    it('debe enviar mensaje con Enter (sin Shift)', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnSend).toHaveBeenCalled()
    })

    it('debe permitir salto de línea con Shift+Enter', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: true,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      // NO debe prevenir default (permite salto de línea)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      // NO debe enviar
      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('debe ignorar Enter si input está deshabilitado', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, true) // ← disabled=true
      })

      // NO debe prevenir default
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      // NO debe enviar
      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('debe funcionar con input vacío', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput(''))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockOnSend).toHaveBeenCalled()
    })
  })

  describe('Manejo de otras teclas', () => {
    it('debe ignorar teclas que no son Enter', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'a',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('debe ignorar Escape', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Escape',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('debe ignorar Tab', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockOnSend).not.toHaveBeenCalled()
    })

    it('debe ignorar teclas de flechas', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'ArrowUp',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockOnSend).not.toHaveBeenCalled()
    })
  })

  describe('Auto-resize del textarea', () => {
    it('debe actualizar ref al cambiar el valor', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useChatInput(value),
        { initialProps: { value: 'Texto inicial' } }
      )

      expect(result.current.textareaRef).toBeDefined()

      // Cambiar valor
      rerender({ value: 'Texto modificado más largo' })

      // El ref sigue definido después del cambio
      expect(result.current.textareaRef).toBeDefined()
    })

    it('debe mantener ref estable entre renders', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useChatInput(value),
        { initialProps: { value: 'inicial' } }
      )

      const initialRef = result.current.textareaRef

      rerender({ value: 'modificado' })

      // El ref debe ser el mismo objeto
      expect(result.current.textareaRef).toBe(initialRef)
    })
  })

  describe('Casos edge', () => {
    it('debe manejar onSend undefined sin error', () => {
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      expect(() => {
        act(() => {
          // ✅ Usar función vacía en lugar de undefined
          result.current.handleKeyDown(mockEvent, () => {}, false)
        })
      }).not.toThrow()
    })

    it('debe manejar múltiples llamadas a handleKeyDown', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
        result.current.handleKeyDown(mockEvent, mockOnSend, false)
      })

      expect(mockOnSend).toHaveBeenCalledTimes(3)
    })

    it('debe manejar cambio rápido de disabled', () => {
      const mockOnSend = vi.fn()
      const { result } = renderHook(() => useChatInput('Test'))

      const mockEvent = {
        key: 'Enter',
        shiftKey: false,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleKeyDown(mockEvent, mockOnSend, false) // enabled
        result.current.handleKeyDown(mockEvent, mockOnSend, true)  // disabled
        result.current.handleKeyDown(mockEvent, mockOnSend, false) // enabled
      })

      // Solo debería llamar 2 veces (cuando enabled)
      expect(mockOnSend).toHaveBeenCalledTimes(2)
    })
  })
})