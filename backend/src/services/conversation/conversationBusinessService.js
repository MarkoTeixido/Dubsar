import { conversationService } from "../integrations/supabaseService.js";
import { messageService } from "../chat/messageService.js";
import { logger } from "../../utils/logger.js";

/**
 * Servicio de Lógica de Negocio de Conversaciones
 * Maneja validaciones y operaciones complejas de conversaciones
 */
export const conversationBusinessService = {
  /**
   * Crea una nueva conversación
   */
  async createConversation(userId, title = "Nueva conversación") {
    const conversation = await conversationService.create(userId, title);
    logger.info(`✨ Nueva conversación creada: ${conversation.id}`);
    return conversation;
  },

  /**
   * Obtiene todas las conversaciones de un usuario
   */
  async getUserConversations(userId) {
    const conversations = await conversationService.getAllByUser(userId);
    return conversations;
  },

  /**
   * Obtiene los mensajes de una conversación con validación de acceso
   */
  async getConversationMessages(conversationId, userId) {
    logger.info(`🔍 Verificando acceso a conversación ${conversationId} para usuario ${userId}`);

    // Verificar ownership
    const isOwner = await conversationService.verifyOwnership(conversationId, userId);
    logger.info(`🔐 Usuario ${userId} es dueño de conversación ${conversationId}: ${isOwner}`);

    if (!isOwner) {
      logger.error(`❌ Acceso denegado: Usuario ${userId} no es dueño de conversación ${conversationId}`);
      throw new Error("FORBIDDEN: No tienes permiso para ver esta conversación");
    }

    const messages = await messageService.getHistory(conversationId);
    logger.info(`✅ ${messages.length} mensajes encontrados para conversación ${conversationId}`);

    return messages;
  },

  /**
   * Actualiza el título de una conversación con validación
   */
  async updateConversationTitle(conversationId, userId, title) {
    // Validar título
    if (!title || title.trim() === "") {
      throw new Error("VALIDATION: El título no puede estar vacío");
    }

    const conversation = await conversationService.updateTitle(conversationId, userId, title);
    logger.info(`✏️ Conversación ${conversationId} renombrada a: ${title}`);

    return conversation;
  },

  /**
   * Elimina una conversación
   */
  async deleteConversation(conversationId, userId) {
    await conversationService.delete(conversationId, userId);
    logger.info(`🗑️ Conversación ${conversationId} eliminada por usuario ${userId}`);
  },
};