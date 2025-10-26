import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { storage } from '@/lib/storage'

describe('storage - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Generación de IDs anónimos', () => {
    it('debe generar ID único con prefijo anon_', () => {
      const id = storage.generateAnonymousId()

      expect(id).toMatch(/^anon_\d+_[a-z0-9]+$/)
    })

    it('debe generar IDs diferentes en llamadas consecutivas', () => {
      const id1 = storage.generateAnonymousId()
      const id2 = storage.generateAnonymousId()

      expect(id1).not.toBe(id2)
    })
  })

  describe('CRUD de conversaciones anónimas', () => {
    it('debe guardar y recuperar conversación anónima', () => {
      const conversation = {
        id: 'anon-123',
        title: 'Test Chat',
        messages: [
          { sender: 'user' as const, text: 'Hola', timestamp: '2025-01-01' },
        ],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      storage.saveAnonymousConversation(conversation)

      const retrieved = storage.getAnonymousConversation('anon-123')

      expect(retrieved).toEqual(conversation)
    })

    it('debe obtener todas las conversaciones anónimas', () => {
      const conv1 = {
        id: 'anon-1',
        title: 'Chat 1',
        messages: [],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      const conv2 = {
        id: 'anon-2',
        title: 'Chat 2',
        messages: [],
        created_at: '2025-01-02',
        updated_at: '2025-01-02',
      }

      storage.saveAnonymousConversation(conv1)
      storage.saveAnonymousConversation(conv2)

      const all = storage.getAnonymousConversations()

      expect(all).toHaveLength(2)
      expect(all[0].id).toBe('anon-1')
      expect(all[1].id).toBe('anon-2')
    })

    it('debe actualizar conversación existente', () => {
      const original = {
        id: 'anon-123',
        title: 'Original',
        messages: [],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      storage.saveAnonymousConversation(original)

      const updated = {
        ...original,
        title: 'Updated',
        updated_at: '2025-01-02',
      }

      storage.saveAnonymousConversation(updated)

      const retrieved = storage.getAnonymousConversation('anon-123')

      expect(retrieved?.title).toBe('Updated')
    })

    it('debe eliminar conversación anónima', () => {
      const conversation = {
        id: 'anon-123',
        title: 'Test',
        messages: [],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      storage.saveAnonymousConversation(conversation)
      storage.deleteAnonymousConversation('anon-123')

      const retrieved = storage.getAnonymousConversation('anon-123')

      expect(retrieved).toBeNull()
    })

    it('debe limpiar todas las conversaciones anónimas', () => {
      const conv1 = {
        id: 'anon-1',
        title: 'Chat 1',
        messages: [],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      storage.saveAnonymousConversation(conv1)
      storage.setCurrentAnonymousId('anon-1')
      storage.setMessageCount(5)

      storage.clearAnonymousConversations()

      expect(storage.getAnonymousConversations()).toHaveLength(0)
      expect(storage.getCurrentAnonymousId()).toBeNull()
      expect(storage.getMessageCount()).toBe(0)
    })

    it('debe retornar null si conversación no existe', () => {
      const retrieved = storage.getAnonymousConversation('inexistente')

      expect(retrieved).toBeNull()
    })

    it('debe guardar conversaciones con archivos adjuntos', () => {
      const conversation = {
        id: 'anon-123',
        title: 'Con archivo',
        messages: [
          {
            sender: 'user' as const,
            text: 'Mira esto',
            timestamp: '2025-01-01',
            fileUrl: 'data:image/png;base64,abc',
            fileName: 'image.png',
            fileType: 'image/png',
            fileSize: 1024,
          },
        ],
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      }

      storage.saveAnonymousConversation(conversation)

      const retrieved = storage.getAnonymousConversation('anon-123')

      expect(retrieved?.messages[0].fileUrl).toBe('data:image/png;base64,abc')
      expect(retrieved?.messages[0].fileName).toBe('image.png')
    })
  })

  describe('ID de conversación actual', () => {
    it('debe guardar y recuperar ID actual', () => {
      storage.setCurrentAnonymousId('anon-123')

      expect(storage.getCurrentAnonymousId()).toBe('anon-123')
    })

    it('debe retornar null si no hay ID actual', () => {
      expect(storage.getCurrentAnonymousId()).toBeNull()
    })

    it('debe limpiar ID actual al limpiar conversaciones', () => {
      storage.setCurrentAnonymousId('anon-123')
      storage.clearAnonymousConversations()

      expect(storage.getCurrentAnonymousId()).toBeNull()
    })
  })

  describe('Conteo de mensajes', () => {
    it('debe inicializar en 0', () => {
      expect(storage.getMessageCount()).toBe(0)
    })

    it('debe establecer conteo de mensajes', () => {
      storage.setMessageCount(5)

      expect(storage.getMessageCount()).toBe(5)
    })

    it('debe incrementar conteo de mensajes', () => {
      storage.setMessageCount(5)
      storage.incrementMessageCount()

      expect(storage.getMessageCount()).toBe(6)
    })

    it('debe resetear conteo de mensajes', () => {
      storage.setMessageCount(10)
      storage.resetMessageCount()

      expect(storage.getMessageCount()).toBe(0)
    })

    it('debe verificar si alcanzó límite de mensajes', () => {
      storage.setMessageCount(14)
      expect(storage.hasReachedMessageLimit()).toBe(false)

      storage.setMessageCount(15)
      expect(storage.hasReachedMessageLimit()).toBe(true)

      storage.setMessageCount(20)
      expect(storage.hasReachedMessageLimit()).toBe(true)
    })

    it('debe calcular mensajes restantes', () => {
      storage.setMessageCount(0)
      expect(storage.getRemainingMessages()).toBe(15)

      storage.setMessageCount(10)
      expect(storage.getRemainingMessages()).toBe(5)

      storage.setMessageCount(15)
      expect(storage.getRemainingMessages()).toBe(0)

      storage.setMessageCount(20)
      expect(storage.getRemainingMessages()).toBe(0)
    })
  })

  describe('Conteo de conversaciones', () => {
    it('debe inicializar en 0', () => {
      expect(storage.getConversationCount()).toBe(0)
    })

    it('debe establecer conteo de conversaciones', () => {
      storage.setConversationCount(2)

      expect(storage.getConversationCount()).toBe(2)
    })

    it('debe incrementar conteo de conversaciones', () => {
      storage.setConversationCount(1)
      storage.incrementConversationCount()

      expect(storage.getConversationCount()).toBe(2)
    })

    it('debe resetear conteo de conversaciones', () => {
      storage.setConversationCount(3)
      storage.resetConversationCount()

      expect(storage.getConversationCount()).toBe(0)
    })

    it('debe verificar si alcanzó límite de conversaciones', () => {
      storage.setConversationCount(2)
      expect(storage.hasReachedConversationLimit()).toBe(false)

      storage.setConversationCount(3)
      expect(storage.hasReachedConversationLimit()).toBe(true)

      storage.setConversationCount(5)
      expect(storage.hasReachedConversationLimit()).toBe(true)
    })

    it('debe calcular conversaciones restantes', () => {
      storage.setConversationCount(0)
      expect(storage.getRemainingConversations()).toBe(3)

      storage.setConversationCount(2)
      expect(storage.getRemainingConversations()).toBe(1)

      storage.setConversationCount(3)
      expect(storage.getRemainingConversations()).toBe(0)
    })
  })

  describe('Archivos anónimos', () => {
    it('debe guardar y recuperar archivo anónimo', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })

      const saved = await storage.uploadAnonymousFile(file, 'conv-123')

      expect(saved.name).toBe('test.txt')
      expect(saved.type).toBe('text/plain')
      expect(saved.conversationId).toBe('conv-123')
      expect(saved.base64).toContain('data:text/plain;base64')
    })

    it('debe obtener todos los archivos anónimos', async () => {
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' })

      await storage.uploadAnonymousFile(file1, 'conv-1')
      await storage.uploadAnonymousFile(file2, 'conv-2')

      const files = storage.getAnonymousFiles()

      expect(files).toHaveLength(2)
    })

    it('debe contar archivos correctamente', async () => {
      expect(storage.getFileCount()).toBe(0)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file, 'conv-123')

      expect(storage.getFileCount()).toBe(1)
    })

    it('debe verificar si puede subir archivo', async () => {
      expect(storage.canUploadFile()).toBe(true)

      const file1 = new File(['1'], 'file1.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file1, 'conv-1')

      expect(storage.canUploadFile()).toBe(true)

      const file2 = new File(['2'], 'file2.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file2, 'conv-2')

      expect(storage.canUploadFile()).toBe(false)
    })

    it('debe lanzar error al alcanzar límite de archivos', async () => {
      const file1 = new File(['1'], 'file1.txt', { type: 'text/plain' })
      const file2 = new File(['2'], 'file2.txt', { type: 'text/plain' })
      const file3 = new File(['3'], 'file3.txt', { type: 'text/plain' })

      await storage.uploadAnonymousFile(file1, 'conv-1')
      await storage.uploadAnonymousFile(file2, 'conv-2')

      await expect(
        storage.uploadAnonymousFile(file3, 'conv-3')
      ).rejects.toThrow('Has alcanzado el límite de 2 archivos')
    })

    it('debe lanzar error con archivo demasiado grande', async () => {
      const largeContent = 'x'.repeat(31 * 1024 * 1024) // 31 MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' })

      await expect(
        storage.uploadAnonymousFile(largeFile, 'conv-123')
      ).rejects.toThrow('El archivo es demasiado grande')
    })

    it('debe verificar límite de archivos', async () => {
      expect(storage.hasReachedFileLimit()).toBe(false)

      const file1 = new File(['1'], 'file1.txt', { type: 'text/plain' })
      const file2 = new File(['2'], 'file2.txt', { type: 'text/plain' })

      await storage.uploadAnonymousFile(file1, 'conv-1')
      expect(storage.hasReachedFileLimit()).toBe(false)

      await storage.uploadAnonymousFile(file2, 'conv-2')
      expect(storage.hasReachedFileLimit()).toBe(true)
    })

    it('debe calcular archivos restantes', async () => {
      expect(storage.getRemainingFiles()).toBe(2)

      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file, 'conv-1')

      expect(storage.getRemainingFiles()).toBe(1)
    })

    it('debe limpiar archivos anónimos', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file, 'conv-123')

      storage.clearAnonymousFiles()

      expect(storage.getAnonymousFiles()).toHaveLength(0)
    })

    it('debe limpiar archivos al limpiar conversaciones', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' })
      await storage.uploadAnonymousFile(file, 'conv-123')

      storage.clearAnonymousConversations()

      expect(storage.getAnonymousFiles()).toHaveLength(0)
    })
  })

  describe('Reseteo de límites', () => {
    it('debe resetear todos los límites', () => {
      storage.setMessageCount(10)
      storage.setConversationCount(2)

      storage.resetLimits()

      expect(storage.getMessageCount()).toBe(0)
      expect(storage.getConversationCount()).toBe(0)
    })
  })
})