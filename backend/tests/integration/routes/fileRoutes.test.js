import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../src/app.js';
import { supabase, supabaseAdmin } from '../../../src/config/database.js';

vi.mock('../../../src/config/database.js');

describe('Integration: File Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /files/upload', () => {
    it('debe subir archivo anónimo', async () => {
      // Mock storage upload
      supabaseAdmin.storage.from.mockReturnValue({
        upload: vi.fn().mockResolvedValue({
          data: { path: 'conv-123/file.pdf' },
          error: null,
        }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://storage.com/file.pdf' },
        }),
      });

      const response = await request(app)
        .post('/files/upload')
        .field('conversationId', 'conv-anon-123')
        .attach('file', Buffer.from('test content'), 'test.pdf');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.file.url).toBeTruthy();
    });

    it('debe rechazar archivo sin conversationId', async () => {
      const response = await request(app)
        .post('/files/upload')
        .attach('file', Buffer.from('test'), 'test.pdf');

      expect(response.status).toBe(400);
    });

    it('debe rechazar sin archivo', async () => {
      const response = await request(app)
        .post('/files/upload')
        .field('conversationId', 'conv-123');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /files/status', () => {
    it('debe obtener estado para anónimo', async () => {
      const response = await request(app).get('/files/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.limit).toBe(2);
    });

    it('debe obtener estado para autenticado', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: 'user-123' },
        },
        error: null,
      });

      // Mock countUserFiles
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ id: 'conv-1' }],
          error: null,
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          count: 2,
          error: null,
        }),
      });

      const response = await request(app)
        .get('/files/status')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(4);
    });
  });
});