import { describe, it, expect } from 'vitest'
import { cn, formatFileSize } from '@/lib/utils'

describe('utils - Unit Tests', () => {
  describe('cn (className merger)', () => {
    it('debe combinar clases simples', () => {
      const result = cn('class1', 'class2', 'class3')

      expect(result).toBe('class1 class2 class3')
    })

    it('debe manejar clases condicionales', () => {
      const result = cn('base', true && 'truthy', false && 'falsy')

      expect(result).toBe('base truthy')
    })

    it('debe hacer merge de clases de Tailwind conflictivas', () => {
      const result = cn('p-4', 'p-8')

      // twMerge debe mantener solo la última
      expect(result).toBe('p-8')
    })

    it('debe manejar arrays de clases', () => {
      const result = cn(['class1', 'class2'], 'class3')

      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('debe manejar objetos condicionales', () => {
      const result = cn({
        'active': true,
        'disabled': false,
        'visible': true,
      })

      expect(result).toContain('active')
      expect(result).toContain('visible')
      expect(result).not.toContain('disabled')
    })

    it('debe manejar undefined y null', () => {
      const result = cn('base', undefined, null, 'end')

      expect(result).toBe('base end')
    })

    it('debe manejar strings vacíos', () => {
      const result = cn('', 'class1', '', 'class2')

      expect(result).toBe('class1 class2')
    })
  })

  describe('formatFileSize', () => {
    it('debe formatear bytes correctamente', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(100)).toBe('100 B')
      expect(formatFileSize(1023)).toBe('1023 B')
    })

    it('debe formatear kilobytes correctamente', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(10240)).toBe('10.0 KB')
      expect(formatFileSize(102400)).toBe('100.0 KB')
    })

    it('debe formatear megabytes correctamente', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB')
      expect(formatFileSize(100 * 1024 * 1024)).toBe('100.0 MB')
    })

    it('debe redondear a 1 decimal', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1587)).toBe('1.5 KB')
      expect(formatFileSize(1638)).toBe('1.6 KB')
    })

    it('debe manejar archivos grandes', () => {
      const largeFile = 500 * 1024 * 1024 // 500 MB
      expect(formatFileSize(largeFile)).toBe('500.0 MB')
    })

    it('debe manejar archivos muy pequeños', () => {
      expect(formatFileSize(1)).toBe('1 B')
      expect(formatFileSize(10)).toBe('10 B')
    })
  })
})