import { ApiClient } from './client';

/**
 * ConversationsApi - Gestiona todos los endpoints de conversaciones
 */
class ConversationsApi extends ApiClient {
  async getConversations() {
    try {
      const data = await this.get('/conversations');
      return data.conversations || data;
    } catch (error) {
      console.error('❌ Error al obtener conversaciones:', error);
      throw error;
    }
  }

  async createConversation(title: string) {
    try {
      const data = await this.post('/conversations', { title });
      return data.conversation || data;
    } catch (error) {
      console.error('❌ Error al crear conversación:', error);
      throw error;
    }
  }

  async deleteConversation(id: string) {
    try {
      return await this.delete(`/conversations/${id}`);
    } catch (error) {
      console.error('❌ Error al eliminar conversación:', error);
      throw error;
    }
  }

  async updateConversationTitle(id: string, title: string) {
    try {
      const data = await this.put(`/conversations/${id}`, { title });
      return data.conversation || data;
    } catch (error) {
      console.error('❌ Error al actualizar conversación:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string) {
    console.log(`📡 Obteniendo mensajes de conversación: ${conversationId}`);

    try {
      const data = await this.get(`/conversations/${conversationId}/messages`);
      const messageCount = data.messages?.length || data.length || 0;
      console.log(`✅ Mensajes obtenidos: ${messageCount}`);
      return data.messages || data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.log('⚠️ Conversación no encontrada, retornando mensajes vacíos');
        return [];
      }
      console.error(`❌ Error al obtener mensajes:`, error);
      throw error;
    }
  }
}

export const conversations = new ConversationsApi();