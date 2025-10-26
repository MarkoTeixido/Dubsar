import { conversationService } from "../integrations/supabaseService.js";
import { messageService } from "./messageService.js";

/**
 * Servicio de Chat
 * Maneja la lógica de negocio del chat
 */
export const chatService = {
  /**
   * Valida que el usuario tenga acceso a la conversación
   */
  async validateAccess(conversationId, userId) {
    if (!userId) {
      return true; // Usuario anónimo, permitir acceso
    }

    const isOwner = await conversationService.verifyOwnership(conversationId, userId);
    if (!isOwner) {
      throw new Error("No tienes permiso para usar esta conversación");
    }

    return true;
  },

  /**
   * Guarda el mensaje del usuario (solo si está autenticado)
   */
  async saveUserMessage(userId, conversationId, message, fileData) {
    if (!userId) {
      return; // No guardar si es anónimo
    }

    await messageService.saveUserMessage(conversationId, message, fileData);
  },

  /**
   * Obtiene el historial formateado para Gemini
   */
  async getFormattedHistory(userId, conversationId, excludeLast = true) {
    if (!userId) {
      return []; // Usuario anónimo, sin historial
    }

    try {
      const history = await messageService.getHistory(conversationId);
      const historyToFormat = excludeLast ? history.slice(0, -1) : history;
      return await messageService.formatForGemini(historyToFormat);
    } catch (error) {
      console.log(`⚠️ No se pudo obtener historial:`, error.message);
      return [];
    }
  },

  /**
   * Guarda la respuesta del bot (solo si está autenticado)
   */
  async saveBotResponse(userId, conversationId, response) {
    if (!userId) {
      return; // No guardar si es anónimo
    }

    await messageService.saveBotMessage(conversationId, response);
    await conversationService.updateTimestamp(conversationId);
  },

  /**
   * Obtiene el conteo de mensajes
   */
  async getMessageCount(userId, conversationId) {
    if (!userId) {
      return 0;
    }

    return await messageService.countMessages(conversationId);
  },
};