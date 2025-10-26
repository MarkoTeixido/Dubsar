import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDarkMode } from '@/hooks/ui/useDarkMode'

describe('useDarkMode - Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  describe('Estado inicial', () => {
    it('debe inicializar con dark mode desactivado por defecto', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      expect(result.current.darkMode).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('debe cargar preferencia dark mode desde localStorage', async () => {
      localStorage.setItem('darkMode', 'true')

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
        expect(result.current.darkMode).toBe(true)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('debe cargar preferencia light mode desde localStorage', async () => {
      localStorage.setItem('darkMode', 'false')

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
        expect(result.current.darkMode).toBe(false)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('debe marcar como mounted después de inicializar', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })
    })

    it('debe exponer función toggleDarkMode', () => {
      const { result } = renderHook(() => useDarkMode())

      expect(typeof result.current.toggleDarkMode).toBe('function')
    })
  })

  describe('Toggle de dark mode', () => {
    it('debe activar dark mode al hacer toggle desde light', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      expect(result.current.darkMode).toBe(false)

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(true)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('darkMode')).toBe('true')
    })

    it('debe desactivar dark mode al hacer toggle desde dark', async () => {
      localStorage.setItem('darkMode', 'true')

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
        expect(result.current.darkMode).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(false)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(localStorage.getItem('darkMode')).toBe('false')
    })

    it('debe poder hacer múltiples toggles consecutivos', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      // Toggle 1: activar
      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(true)
      })

      // Toggle 2: desactivar
      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(false)
      })

      // Toggle 3: activar de nuevo
      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(true)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('darkMode')).toBe('true')
    })
  })

  describe('Sincronización con DOM', () => {
    it('debe agregar clase dark al documentElement cuando se activa', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })

    it('debe remover clase dark del documentElement cuando se desactiva', async () => {
      localStorage.setItem('darkMode', 'true')

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      })
    })

    it('debe aplicar clase dark al cargar si está guardado en localStorage', async () => {
      localStorage.setItem('darkMode', 'true')

      renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      })
    })
  })

  describe('Persistencia en localStorage', () => {
    it('debe guardar true en localStorage al activar dark mode', async () => {
      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(localStorage.getItem('darkMode')).toBe('true')
      })
    })

    it('debe guardar false en localStorage al desactivar dark mode', async () => {
      localStorage.setItem('darkMode', 'true')

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(localStorage.getItem('darkMode')).toBe('false')
      })
    })

    it('debe persistir cambios entre re-renders', async () => {
      const { result, rerender } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(true)
      })

      rerender()

      expect(result.current.darkMode).toBe(true)
      expect(localStorage.getItem('darkMode')).toBe('true')
    })
  })

  describe('Casos edge', () => {
    it('debe manejar localStorage vacío correctamente', async () => {
      expect(localStorage.getItem('darkMode')).toBeNull()

      const { result } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      expect(result.current.darkMode).toBe(false)
    })

    it('debe crashear con valor JSON inválido en localStorage', () => {
      localStorage.setItem('darkMode', 'invalid')

      // El hook debería crashear porque JSON.parse('invalid') lanza error
      expect(() => {
        renderHook(() => useDarkMode())
      }).toThrow()
    })

    it('debe limpiar efectos al desmontar', async () => {
      const { result, unmount } = renderHook(() => useDarkMode())

      await waitFor(() => {
        expect(result.current.mounted).toBe(true)
      })

      act(() => {
        result.current.toggleDarkMode()
      })

      await waitFor(() => {
        expect(result.current.darkMode).toBe(true)
      })

      unmount()

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})