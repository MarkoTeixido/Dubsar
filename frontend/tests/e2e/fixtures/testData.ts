export const mockUsers = {
  testUser: {
    id: 'test-user-123',
    email: 'test@example.com',
    fullName: 'Test User',
    avatar: null,
  },
  premiumUser: {
    id: 'premium-user-456',
    email: 'premium@example.com',
    fullName: 'Premium User',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
}

export const mockSessions = {
  valid: {
    access_token: 'mock-access-token-abc123',
    refresh_token: 'mock-refresh-token-xyz789',
    expires_in: 3600,
  },
}

export const mockConversations = [
  {
    id: 'conv-1',
    title: 'Primera conversación',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'conv-2',
    title: 'Segunda conversación',
    created_at: '2025-01-14T08:00:00Z',
    updated_at: '2025-01-14T12:00:00Z',
  },
]

export const mockMessages = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'Hola, ¿cómo estás?',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'msg-2',
    sender: 'bot',
    text: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?',
    created_at: '2025-01-15T10:00:05Z',
    isStreaming: false,
  },
]

// Helpers para crear respuestas mock
export const createLoginResponse = (success = true) => {
  if (success) {
    return {
      user: mockUsers.testUser,
      session: mockSessions.valid,
    }
  }
  return { message: 'Credenciales incorrectas' }
}

export const createRegisterResponse = (email: string, fullName?: string) => {
  return {
    user: {
      id: `user-${Date.now()}`,
      email,
      fullName: fullName || null,
      avatar: null,
    },
  }
}

export const createStreamResponse = (message: string) => {
  const response = `Recibí tu mensaje: "${message}". ¿En qué más puedo ayudarte?`
  return response
}