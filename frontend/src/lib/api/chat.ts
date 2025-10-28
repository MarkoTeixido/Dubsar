import { ApiClient } from './client';

/**
 * ChatApi - Gestiona todos los endpoints de chat
 */
class ChatApi extends ApiClient {
  /**
   * Envía un mensaje al chat con streaming
   * @param conversationId - ID de la conversación
   * @param message - Texto del mensaje
   * @param fileData - Datos del archivo adjunto (opcional)
   * @param clientHistory - Historial de mensajes para contexto (opcional, para usuarios anónimos)
   * @returns Response con stream SSE
   */
  async sendMessage(
    conversationId: string,
    message: string,
    fileData?: {
      url: string;
      name: string;
      type: string;
      size: number;
      category: string;
    } | null,
    clientHistory?: Array<{ sender: string; text: string }> // ✅ NUEVO parámetro
  ): Promise<Response> {
    return this.postStream('/chat/stream', {
      message,
      conversationId,
      fileData,
      clientHistory, // ✅ NUEVO: Enviar historial al backend
    });
  }
}

export const chat = new ChatApi();