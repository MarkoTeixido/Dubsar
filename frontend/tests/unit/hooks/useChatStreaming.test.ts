import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStreaming } from '@/hooks/chat/useChatStreaming'

describe('useChatStreaming - Unit Tests', () => {
  describe('API del hook', () => {
    it('debe exponer función startStreaming', () => {
      const { result } = renderHook(() => useChatStreaming())

      expect(typeof result.current.startStreaming).toBe('function')
    })

    it('debe exponer función abortStreaming', () => {
      const { result } = renderHook(() => useChatStreaming())

      expect(typeof result.current.abortStreaming).toBe('function')
    })

    it('debe poder llamar abortStreaming sin errores cuando no hay stream activo', () => {
      const { result } = renderHook(() => useChatStreaming())

      expect(() => {
        act(() => {
          result.current.abortStreaming()
        })
      }).not.toThrow()
    })
  })
})