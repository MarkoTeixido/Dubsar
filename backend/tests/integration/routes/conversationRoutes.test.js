import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import { supabase } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('Integration: Conversation Routes', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /conversations', () => {
    it('debe crear conversación autenticado', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'conv-123',
            user_id: 'user-123',
            title: 'Nueva conversación',
            created_at: '2025-01-26T03:44:57Z',
          },
          error: null,
        }),
      });

      const response = await request(app)
        .post('/conversations')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Mi conversación',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.conversation.id).toBe('conv-123');
    });

    it('debe crear conversación con título por defecto', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'conv-456',
            user_id: 'user-123',
            title: 'Nueva conversación',
          },
          error: null,
        }),
      });

      const response = await request(app)
        .post('/conversations')
        .set('Authorization', 'Bearer valid-token')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.conversation.title).toBeTruthy();
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .post('/conversations')
        .send({
          title: 'Test',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /conversations', () => {
    it('debe obtener conversaciones del usuario', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 'conv-1', title: 'Conv 1', updated_at: '2025-01-26T03:00:00Z' },
            { id: 'conv-2', title: 'Conv 2', updated_at: '2025-01-26T02:00:00Z' },
            { id: 'conv-3', title: 'Conv 3', updated_at: '2025-01-26T01:00:00Z' },
          ],
          error: null,
        }),
      });

      const response = await request(app)
        .get('/conversations')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.conversations).toHaveLength(3);
    });

    it('debe retornar array vacío sin conversaciones', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const response = await request(app)
        .get('/conversations')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.conversations).toEqual([]);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app).get('/conversations');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /conversations/:id/messages', () => {
    it('debe obtener mensajes de conversación propia', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock verifyOwnership
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'conv-123' },
          error: null,
        }),
      });

      // Mock getHistory
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { sender: 'user', text: 'Hola bot', created_at: '2025-01-26T03:40:00Z' },
            { sender: 'bot', text: 'Hola! ¿En qué puedo ayudarte?', created_at: '2025-01-26T03:40:05Z' },
            { sender: 'user', text: '¿Qué es Node.js?', created_at: '2025-01-26T03:41:00Z' },
          ],
          error: null,
        }),
      });

      const response = await request(app)
        .get('/conversations/conv-123/messages')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.messages).toHaveLength(3);
    });

    it('debe rechazar acceso a conversación ajena', async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        supabase.from.mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
            }),
        });

        const response = await request(app)
            .get('/conversations/conv-456/messages')
            .set('Authorization', 'Bearer valid-token');

        expect(response.status).toBe(403); 
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app).get('/conversations/conv-123/messages');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /conversations/:id', () => {
    it('debe actualizar título de conversación', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      supabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'conv-123',
            title: 'Título actualizado',
            updated_at: '2025-01-26T03:44:57Z',
          },
          error: null,
        }),
      });

      const response = await request(app)
        .put('/conversations/conv-123')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Título actualizado',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.conversation.title).toBe('Título actualizado');
    });

    it('debe rechazar título vacío', async () => {
        supabase.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        const response = await request(app)
            .put('/conversations/conv-123')
            .set('Authorization', 'Bearer valid-token')
            .send({
            title: '',
            });

        expect(response.status).toBe(400);
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app)
        .put('/conversations/conv-123')
        .send({
          title: 'Test',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /conversations/:id', () => {
    it('debe eliminar conversación propia', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockChain.eq = vi.fn()
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ error: null });

      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(mockChain),
      });

      const response = await request(app)
        .delete('/conversations/conv-123')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeTruthy();
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app).delete('/conversations/conv-123');

      expect(response.status).toBe(401);
    });

    it('debe manejar error al eliminar', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockChain = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
      };

      mockChain.eq = vi.fn()
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ error: { message: 'Delete failed' } });

      supabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue(mockChain),
      });

      const response = await request(app)
        .delete('/conversations/conv-456')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(500);
    });
  });
});