import { vi } from 'vitest';
import dotenv from 'dotenv';

// Cargar variables de entorno de test
dotenv.config({ path: '.env.test' });

// ⚡ Mock de Google Generative AI (DEBE SER ANTES de importar otros módulos)
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(function() {
    return {
      getGenerativeModel: vi.fn(() => ({
        startChat: vi.fn(() => ({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Respuesta mock de Gemini',
            },
          }),
          sendMessageStream: vi.fn().mockResolvedValue({
            stream: [
              { text: () => 'Hola ' },
              { text: () => 'desde ' },
              { text: () => 'Gemini' },
            ],
          }),
        })),
        generateContent: vi.fn(),
        generateContentStream: vi.fn(),
      })),
    };
  }),
}));

// Mock de Supabase para tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      refreshSession: vi.fn(),
      admin: {
        updateUserById: vi.fn(),
        deleteUser: vi.fn(),
      },
    },
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
  })),
}));

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
});