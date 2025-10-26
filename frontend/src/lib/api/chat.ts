import { ApiClient } from './client';

/**
 * ChatApi - Gestiona todos los endpoints de chat
 */
class ChatApi extends ApiClient {
  async sendMessage(
    conversationId: string,
    message: string,
    fileData?: {
      url: string;
      name: string;
      type: string;
      size: number;
      category: string;
    } | null
  ): Promise<Response> {
    return this.postStream('/chat/stream', {
      message,
      conversationId,
      fileData,
    });
  }
}

export const chat = new ChatApi();