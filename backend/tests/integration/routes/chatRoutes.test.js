import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import { supabase } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('Integration: Chat Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /chat', () => {
    it('debe permitir chat anónimo', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hola bot',
          conversationId: 'conv-anon-123',
        });

      expect(response.status).toBe(200);
      expect(response.body.response).toBe('Respuesta mock de Gemini');
      expect(response.body.success).toBe(true);
    });

    it('debe permitir chat autenticado', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
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

      // Mock saveUserMessage
      supabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      // Mock getHistory
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      // Mock saveBotMessage
      supabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      // Mock updateTimestamp
      supabase.from.mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const response = await request(app)
        .post('/chat')
        .set('Authorization', 'Bearer valid-token')
        .send({
          message: 'Hola desde usuario autenticado',
          conversationId: 'conv-123',
        });

      expect(response.status).toBe(200);
      expect(response.body.response).toBeTruthy();
    });

    it('debe validar mensaje requerido', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          conversationId: 'conv-123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it('debe validar conversationId requerido', async () => {
      const response = await request(app)
        .post('/chat')
        .send({
          message: 'Hola',
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar acceso a conversación ajena', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
        },
        error: null,
      });

      // Mock verifyOwnership que retorna false
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const response = await request(app)
        .post('/chat')
        .set('Authorization', 'Bearer valid-token')
        .send({
          message: 'Test',
          conversationId: 'conv-456',
        });

      expect(response.status).toBe(403); // ⚡ CAMBIO: 500 → 403
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /chat/stream', () => {
    it('debe validar mensaje requerido', async () => {
      const response = await request(app)
        .post('/chat/stream')
        .send({
          conversationId: 'conv-123',
        });

      expect(response.status).toBe(400);
    });

    it('debe validar conversationId requerido', async () => {
      const response = await request(app)
        .post('/chat/stream')
        .send({
          message: 'Test',
        });

      expect(response.status).toBe(400);
    });
  });
});