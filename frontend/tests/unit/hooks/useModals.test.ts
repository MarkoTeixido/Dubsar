import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useModals } from '@/hooks/ui/useModals'

describe('useModals - Unit Tests', () => {
  describe('Estado inicial', () => {
    it('debe inicializar con todos los modales cerrados', () => {
      const { result } = renderHook(() => useModals())

      expect(result.current.authModalOpen).toBe(false)
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe inicializar authModalTab en login por defecto', () => {
      const { result } = renderHook(() => useModals())

      expect(result.current.authModalTab).toBe('login')
    })

    it('debe exponer API pública correcta', () => {
      const { result } = renderHook(() => useModals())

      expect(typeof result.current.openLoginModal).toBe('function')
      expect(typeof result.current.openRegisterModal).toBe('function')
      expect(typeof result.current.closeAuthModal).toBe('function')
      expect(typeof result.current.openProfileModal).toBe('function')
      expect(typeof result.current.closeProfileModal).toBe('function')
      expect(typeof result.current.openLimitModal).toBe('function')
      expect(typeof result.current.closeLimitModal).toBe('function')
      expect(typeof result.current.openFileLimitModal).toBe('function')
      expect(typeof result.current.closeFileLimitModal).toBe('function')
      expect(typeof result.current.openLoginFromLimit).toBe('function')
      expect(typeof result.current.openRegisterFromLimit).toBe('function')
      expect(typeof result.current.openLoginFromFileLimit).toBe('function')
      expect(typeof result.current.openRegisterFromFileLimit).toBe('function')
    })
  })

  describe('Modal de autenticación', () => {
    it('debe abrir modal en tab de login', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLoginModal()
      })

      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('login')
      
      // Verificar que otros modales permanecen cerrados
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe abrir modal en tab de registro', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openRegisterModal()
      })

      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('register')
      
      // Verificar que otros modales permanecen cerrados
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe cerrar modal de autenticación', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLoginModal()
      })

      expect(result.current.authModalOpen).toBe(true)

      act(() => {
        result.current.closeAuthModal()
      })

      expect(result.current.authModalOpen).toBe(false)
    })

    it('debe poder abrir y cerrar múltiples veces', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLoginModal()
      })
      expect(result.current.authModalOpen).toBe(true)

      act(() => {
        result.current.closeAuthModal()
      })
      expect(result.current.authModalOpen).toBe(false)

      act(() => {
        result.current.openRegisterModal()
      })
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('register')
    })

    it('debe cambiar entre tabs sin cerrar modal', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLoginModal()
      })

      expect(result.current.authModalTab).toBe('login')

      act(() => {
        result.current.openRegisterModal()
      })

      // Modal sigue abierto pero cambia tab
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('register')
    })
  })

  describe('Modal de perfil', () => {
    it('debe abrir modal de perfil', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openProfileModal()
      })

      expect(result.current.profileModalOpen).toBe(true)
      
      // Verificar que otros modales permanecen cerrados
      expect(result.current.authModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe cerrar modal de perfil', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openProfileModal()
      })

      expect(result.current.profileModalOpen).toBe(true)

      act(() => {
        result.current.closeProfileModal()
      })

      expect(result.current.profileModalOpen).toBe(false)
    })

    it('debe poder abrir perfil múltiples veces', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openProfileModal()
      })
      expect(result.current.profileModalOpen).toBe(true)

      act(() => {
        result.current.closeProfileModal()
      })
      expect(result.current.profileModalOpen).toBe(false)

      act(() => {
        result.current.openProfileModal()
      })
      expect(result.current.profileModalOpen).toBe(true)
    })
  })

  describe('Modal de límite de mensajes', () => {
    it('debe abrir modal de límite', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLimitModal()
      })

      expect(result.current.showLimitModal).toBe(true)
      
      // Verificar que otros modales permanecen cerrados
      expect(result.current.authModalOpen).toBe(false)
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe cerrar modal de límite', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLimitModal()
      })

      expect(result.current.showLimitModal).toBe(true)

      act(() => {
        result.current.closeLimitModal()
      })

      expect(result.current.showLimitModal).toBe(false)
    })
  })

  describe('Modal de límite de archivos', () => {
    it('debe abrir modal de límite de archivos', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openFileLimitModal()
      })

      expect(result.current.fileLimitModalOpen).toBe(true)
      
      // Verificar que otros modales permanecen cerrados
      expect(result.current.authModalOpen).toBe(false)
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
    })

    it('debe cerrar modal de límite de archivos', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openFileLimitModal()
      })

      expect(result.current.fileLimitModalOpen).toBe(true)

      act(() => {
        result.current.closeFileLimitModal()
      })

      expect(result.current.fileLimitModalOpen).toBe(false)
    })
  })

  describe('Flujos de transición entre modales', () => {
    it('debe cambiar de modal de límite a login', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLimitModal()
      })

      expect(result.current.showLimitModal).toBe(true)

      act(() => {
        result.current.openLoginFromLimit()
      })

      // Modal de límite se cierra
      expect(result.current.showLimitModal).toBe(false)
      
      // Modal de auth se abre en tab login
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('login')
      
      // Otros modales permanecen cerrados
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe cambiar de modal de límite a registro', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLimitModal()
      })

      act(() => {
        result.current.openRegisterFromLimit()
      })

      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('register')
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })

    it('debe cambiar de modal de archivo a login', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openFileLimitModal()
      })

      act(() => {
        result.current.openLoginFromFileLimit()
      })

      expect(result.current.fileLimitModalOpen).toBe(false)
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('login')
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
    })

    it('debe cambiar de modal de archivo a registro', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openFileLimitModal()
      })

      act(() => {
        result.current.openRegisterFromFileLimit()
      })

      expect(result.current.fileLimitModalOpen).toBe(false)
      expect(result.current.authModalOpen).toBe(true)
      expect(result.current.authModalTab).toBe('register')
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
    })
  })

  describe('Casos edge', () => {
    it('debe manejar apertura de múltiples modales secuencialmente', () => {
      const { result } = renderHook(() => useModals())

      act(() => {
        result.current.openLoginModal()
      })
      expect(result.current.authModalOpen).toBe(true)

      act(() => {
        result.current.closeAuthModal()
        result.current.openProfileModal()
      })
      expect(result.current.authModalOpen).toBe(false)
      expect(result.current.profileModalOpen).toBe(true)

      act(() => {
        result.current.closeProfileModal()
        result.current.openLimitModal()
      })
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(true)
    })

    it('debe mantener estado independiente de cada modal', () => {
      const { result } = renderHook(() => useModals())

      // Abrir auth
      act(() => {
        result.current.openLoginModal()
      })
      expect(result.current.authModalOpen).toBe(true)

      // Cerrar auth, otros siguen cerrados
      act(() => {
        result.current.closeAuthModal()
      })
      expect(result.current.profileModalOpen).toBe(false)
      expect(result.current.showLimitModal).toBe(false)
      expect(result.current.fileLimitModalOpen).toBe(false)
    })
  })
})