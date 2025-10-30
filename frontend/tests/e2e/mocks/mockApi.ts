import { Page } from '@playwright/test'
import {
  mockUsers,
  mockConversations,
  mockMessages,
  createLoginResponse,
  createRegisterResponse,
  createStreamResponse,
} from '../fixtures/testData'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export class MockAPI {
  constructor(private page: Page) {}

  // Mock de login exitoso
  async mockLoginSuccess() {
    await this.page.route(`${API_URL}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createLoginResponse(true)),
      })
    })
  }

  // Mock de login fallido
  async mockLoginFailure() {
    await this.page.route(`${API_URL}/auth/login`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify(createLoginResponse(false)),
      })
    })
  }

  // Mock de registro
  async mockRegister() {
    await this.page.route(`${API_URL}/auth/register`, async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          createRegisterResponse(postData.email, postData.fullName)
        ),
      })
    })
  }

  // Mock de perfil
  async mockGetProfile() {
    await this.page.route(`${API_URL}/auth/me`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUsers.testUser }),
      })
    })
  }

  // Mock de logout
  async mockLogout() {
    await this.page.route(`${API_URL}/auth/logout`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })
  }

  // Mock de conversaciones
  async mockGetConversations() {
    await this.page.route(`${API_URL}/conversations`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ conversations: mockConversations }),
      })
    })
  }

  // Mock de mensajes
  async mockGetMessages(conversationId: string) {
    await this.page.route(
      `${API_URL}/conversations/${conversationId}/messages`,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ messages: mockMessages }),
        })
      }
    )
  }

  // Mock de streaming de chat
  async mockChatStream(customResponse?: string) {
    await this.page.route(`${API_URL}/chat/stream`, async (route) => {
      const request = route.request()
      const postData = request.postDataJSON()
      const message = postData.message
      
      const response = customResponse || createStreamResponse(message)
      
      // Simular Server-Sent Events
      const chunks = response.split('').map((char) => `data: ${JSON.stringify({ chunk: char })}\n\n`)
      chunks.push('data: {"done":true}\n\n')
      
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: chunks.join(''),
      })
    })
  }

  // Mock de creación de conversación
  async mockCreateConversation() {
    await this.page.route(`${API_URL}/conversations`, async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON()
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            conversation: {
              id: `conv-${Date.now()}`,
              title: postData.title,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          }),
        })
      }
    })
  }

  // Mock de eliminación de conversación
  async mockDeleteConversation(conversationId: string) {
    await this.page.route(
      `${API_URL}/conversations/${conversationId}`,
      async (route) => {
        if (route.request().method() === 'DELETE') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
          })
        }
      }
    )
  }

  // Mock de upload de archivo
  async mockFileUpload() {
    await this.page.route(`${API_URL}/files/upload`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          file: {
            url: 'https://storage.example.com/test-file.pdf',
            name: 'test-file.pdf',
            type: 'application/pdf',
            size: 1024,
            category: 'document',
          },
        }),
      })
    })
  }

  // Setup completo para usuario autenticado
  async setupAuthenticatedUser() {
    await this.mockGetProfile()
    await this.mockGetConversations()
    await this.mockChatStream()
    
    // Set tokens en localStorage
    await this.page.addInitScript(() => {
      localStorage.setItem('access_token', 'mock-access-token-abc123')
      localStorage.setItem('refresh_token', 'mock-refresh-token-xyz789')
    })
  }
}