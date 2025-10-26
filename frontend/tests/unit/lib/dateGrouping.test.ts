import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { groupConversationsByDate } from '@/lib/dateGrouping'
import type { Conversation } from '@/hooks/conversations/useConversations'

describe('dateGrouping - Unit Tests', () => {
  beforeEach(() => {
    // Mock de la fecha actual para tests consistentes
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Agrupación por fecha', () => {
    it('debe agrupar conversaciones de hoy', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat de hoy',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 'conv-2',
          title: 'Otro chat de hoy',
          created_at: '2025-01-15T08:00:00Z',
          updated_at: '2025-01-15T11:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Hoy')
      expect(result[0][1]).toHaveLength(2)
    })

    it('debe agrupar conversaciones de ayer', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat de ayer',
          created_at: '2025-01-14T10:00:00Z',
          updated_at: '2025-01-14T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Ayer')
      expect(result[0][1]).toHaveLength(1)
    })

    it('debe agrupar conversaciones de últimos 7 días', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Hace 3 días',
          created_at: '2025-01-12T10:00:00Z',
          updated_at: '2025-01-12T10:00:00Z',
        },
        {
          id: 'conv-2',
          title: 'Hace 5 días',
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-10T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Últimos 7 días')
      expect(result[0][1]).toHaveLength(2)
    })

    it('debe agrupar conversaciones de últimos 30 días', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Hace 15 días',
          created_at: '2024-12-31T10:00:00Z',
          updated_at: '2024-12-31T10:00:00Z',
        },
        {
          id: 'conv-2',
          title: 'Hace 20 días',
          created_at: '2024-12-26T10:00:00Z',
          updated_at: '2024-12-26T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Últimos 30 días')
      expect(result[0][1]).toHaveLength(2)
    })

    it('debe agrupar conversaciones anteriores', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Hace 2 meses',
          created_at: '2024-11-15T10:00:00Z',
          updated_at: '2024-11-15T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Anteriores')
      expect(result[0][1]).toHaveLength(1)
    })
  })

  describe('Ordenamiento dentro de grupos', () => {
    it('debe ordenar conversaciones por fecha más reciente primero', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Más antigua',
          created_at: '2025-01-15T08:00:00Z',
          updated_at: '2025-01-15T08:00:00Z',
        },
        {
          id: 'conv-2',
          title: 'Más reciente',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T12:00:00Z',
        },
        {
          id: 'conv-3',
          title: 'Intermedia',
          created_at: '2025-01-15T09:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result[0][1][0].id).toBe('conv-2')
      expect(result[0][1][1].id).toBe('conv-3')
      expect(result[0][1][2].id).toBe('conv-1')
    })
  })

  describe('Múltiples grupos', () => {
    it('debe crear múltiples grupos correctamente', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Hoy',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 'conv-2',
          title: 'Ayer',
          created_at: '2025-01-14T10:00:00Z',
          updated_at: '2025-01-14T10:00:00Z',
        },
        {
          id: 'conv-3',
          title: '7 días',
          created_at: '2025-01-10T10:00:00Z',
          updated_at: '2025-01-10T10:00:00Z',
        },
        {
          id: 'conv-4',
          title: '30 días',
          created_at: '2024-12-25T10:00:00Z',
          updated_at: '2024-12-25T10:00:00Z',
        },
        {
          id: 'conv-5',
          title: 'Anterior',
          created_at: '2024-10-15T10:00:00Z',
          updated_at: '2024-10-15T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(5)
      expect(result[0][0]).toBe('Hoy')
      expect(result[1][0]).toBe('Ayer')
      expect(result[2][0]).toBe('Últimos 7 días')
      expect(result[3][0]).toBe('Últimos 30 días')
      expect(result[4][0]).toBe('Anteriores')
    })
  })

  describe('Casos edge', () => {
    it('debe retornar array vacío si no hay conversaciones', () => {
      const result = groupConversationsByDate([])

      expect(result).toEqual([])
    })

    it('debe omitir grupos vacíos', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Solo hoy',
          created_at: '2025-01-15T10:00:00Z',
          updated_at: '2025-01-15T10:00:00Z',
        },
      ]

      const result = groupConversationsByDate(conversations)

      expect(result).toHaveLength(1)
      expect(result[0][0]).toBe('Hoy')
    })

    it('debe manejar conversaciones en límite de fecha', () => {
    // Conversación exactamente hace 8 días (debe ir a "Últimos 30 días")
    const conversations: Conversation[] = [
        {
        id: 'conv-1',
        title: 'Exactamente 8 días',
        created_at: '2025-01-07T12:00:00Z',
        updated_at: '2025-01-07T12:00:00Z',
        },
    ]

    const result = groupConversationsByDate(conversations)

    expect(result).toHaveLength(1)
    expect(result[0][0]).toBe('Últimos 30 días')
    })
  })
})