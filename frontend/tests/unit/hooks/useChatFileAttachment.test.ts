import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatFileAttachment } from '@/hooks/chat/useChatFileAttachment'

describe('useChatFileAttachment - Unit Tests', () => {
  let mockPdfFile: File
  let mockImageFile: File

  beforeEach(() => {
    mockPdfFile = new File(['test content'], 'document.pdf', { 
      type: 'application/pdf' 
    })
    mockImageFile = new File(['image data'], 'photo.jpg', { 
      type: 'image/jpeg' 
    })
  })

  describe('Estado inicial', () => {
    it('debe inicializar sin archivo ni error', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })

    it('debe exponer API pública correcta', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      expect(typeof result.current.handleFileSelect).toBe('function')
      expect(typeof result.current.handleRemoveFile).toBe('function')
      expect(typeof result.current.setFileError).toBe('function')
    })
  })

  describe('Selección de archivos', () => {
    it('debe seleccionar archivo PDF y preservar propiedades', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })

      expect(result.current.selectedFile).toBe(mockPdfFile)
      expect(result.current.selectedFile?.name).toBe('document.pdf')
      expect(result.current.selectedFile?.type).toBe('application/pdf')
      expect(result.current.fileError).toBeNull()
    })

    it('debe seleccionar archivo de imagen', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockImageFile)
      })

      expect(result.current.selectedFile).toBe(mockImageFile)
      expect(result.current.selectedFile?.name).toBe('photo.jpg')
      expect(result.current.selectedFile?.type).toBe('image/jpeg')
    })

    it('debe reemplazar archivo al seleccionar uno nuevo', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })

      expect(result.current.selectedFile?.name).toBe('document.pdf')

      act(() => {
        result.current.handleFileSelect(mockImageFile)
      })

      expect(result.current.selectedFile?.name).toBe('photo.jpg')
    })

    it('debe limpiar error al seleccionar archivo', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.setFileError('Error previo')
      })

      expect(result.current.fileError).toBe('Error previo')

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })

      expect(result.current.selectedFile).toBe(mockPdfFile)
      expect(result.current.fileError).toBeNull()
    })
  })

  describe('Remoción de archivos', () => {
    it('debe remover archivo seleccionado', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })

      expect(result.current.selectedFile).toBe(mockPdfFile)

      act(() => {
        result.current.handleRemoveFile()
      })

      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })

    it('debe limpiar error al remover archivo', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
        result.current.setFileError('Error de validación')
      })

      expect(result.current.fileError).toBe('Error de validación')

      act(() => {
        result.current.handleRemoveFile()
      })

      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })

    it('debe poder remover sin tener archivo seleccionado', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      expect(result.current.selectedFile).toBeNull()

      act(() => {
        result.current.handleRemoveFile()
      })

      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })
  })

  describe('Manejo de errores', () => {
    it('debe establecer mensaje de error', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.setFileError('Archivo demasiado grande')
      })

      expect(result.current.fileError).toBe('Archivo demasiado grande')
    })

    it('debe limpiar mensaje de error', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.setFileError('Error temporal')
      })

      expect(result.current.fileError).toBe('Error temporal')

      act(() => {
        result.current.setFileError(null)
      })

      expect(result.current.fileError).toBeNull()
    })

    it('debe mantener archivo seleccionado al establecer error', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })

      expect(result.current.selectedFile).toBe(mockPdfFile)

      act(() => {
        result.current.setFileError('Formato no soportado')
      })

      expect(result.current.selectedFile).toBe(mockPdfFile)
      expect(result.current.fileError).toBe('Formato no soportado')
    })

    it('debe poder cambiar mensaje de error múltiples veces', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      act(() => {
        result.current.setFileError('Error 1')
      })
      expect(result.current.fileError).toBe('Error 1')

      act(() => {
        result.current.setFileError('Error 2')
      })
      expect(result.current.fileError).toBe('Error 2')

      act(() => {
        result.current.setFileError(null)
      })
      expect(result.current.fileError).toBeNull()
    })
  })

  describe('Flujos completos', () => {
    it('debe manejar flujo completo: seleccionar → error → remover', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      // Seleccionar archivo
      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })
      expect(result.current.selectedFile).toBe(mockPdfFile)

      // Establecer error
      act(() => {
        result.current.setFileError('Validación fallida')
      })
      expect(result.current.fileError).toBe('Validación fallida')

      // Remover (limpia todo)
      act(() => {
        result.current.handleRemoveFile()
      })
      expect(result.current.selectedFile).toBeNull()
      expect(result.current.fileError).toBeNull()
    })

    it('debe manejar flujo: error → seleccionar archivo (limpia error)', () => {
      const { result } = renderHook(() => useChatFileAttachment())

      // Establecer error primero
      act(() => {
        result.current.setFileError('Error inicial')
      })
      expect(result.current.fileError).toBe('Error inicial')

      // Seleccionar archivo (debe limpiar error)
      act(() => {
        result.current.handleFileSelect(mockPdfFile)
      })
      expect(result.current.selectedFile).toBe(mockPdfFile)
      expect(result.current.fileError).toBeNull()
    })
  })
})