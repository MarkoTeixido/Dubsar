import { conversationService } from "../integrations/supabaseService.js";
import { messageService } from "./messageService.js";

/**
 * Servicio de Chat
 * Maneja la lógica de negocio del chat
 */
export const chatService = {
  /**
   * Valida que el usuario tenga acceso a la conversación
   * @param {string} conversationId - ID de la conversación
   * @param {string|null} userId - ID del usuario (null para anónimos)
   * @returns {Promise<boolean>}
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
   * @param {string|null} userId - ID del usuario
   * @param {string} conversationId - ID de la conversación
   * @param {string} message - Texto del mensaje
   * @param {Object|null} fileData - Datos del archivo adjunto
   */
  async saveUserMessage(userId, conversationId, message, fileData) {
    if (!userId) {
      return; // No guardar en BD si es anónimo
    }

    await messageService.saveUserMessage(conversationId, message, fileData);
  },

  /**
   * Obtiene el historial formateado para Gemini
   * Ahora acepta historial del cliente para usuarios anónimos
   * @param {string|null} userId - ID del usuario
   * @param {string} conversationId - ID de la conversación
   * @param {Array|null} clientHistory - Historial enviado desde el frontend (para anónimos)
   * @param {boolean} excludeLast - Si debe excluir el último mensaje
   * @returns {Promise<Array>} - Historial formateado para Gemini
   */
  async getFormattedHistory(userId, conversationId, clientHistory = null, excludeLast = true) {
    try {
      // Para usuarios anónimos, usar historial del cliente
      if (!userId && clientHistory && Array.isArray(clientHistory)) {
        console.log(`📜 Usando historial del cliente (${clientHistory.length} mensajes)`);
        const historyToFormat = excludeLast 
          ? clientHistory.slice(0, -1) 
          : clientHistory;
        
        // Limitar a los últimos 20 mensajes (10 intercambios)
        const recentHistory = historyToFormat.slice(-20);
        return await messageService.formatForGemini(recentHistory);
      }

      // Para usuarios autenticados, cargar desde BD
      if (!userId) {
        console.log("⚠️ Usuario anónimo sin historial del cliente");
        return [];
      }

      const history = await messageService.getHistory(conversationId);
      
      // Limitar a los últimos 20 mensajes (10 intercambios) para evitar exceder tokens
      const recentHistory = history.slice(-20);
      
      const historyToFormat = excludeLast 
        ? recentHistory.slice(0, -1) 
        : recentHistory;
        
      return await messageService.formatForGemini(historyToFormat);
    } catch (error) {
      console.log(`⚠️ No se pudo obtener historial:`, error.message);
      return [];
    }
  },

  /**
   * Guarda la respuesta del bot (solo si está autenticado)
   * @param {string|null} userId - ID del usuario
   * @param {string} conversationId - ID de la conversación
   * @param {string} response - Respuesta del bot
   */
  async saveBotResponse(userId, conversationId, response) {
    if (!userId) {
      return; // No guardar en BD si es anónimo
    }

    await messageService.saveBotMessage(conversationId, response);
    await conversationService.updateTimestamp(conversationId);
  },

  /**
   * Obtiene el conteo de mensajes en una conversación
   * @param {string|null} userId - ID del usuario
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<number>}
   */
  async getMessageCount(userId, conversationId) {
    if (!userId) {
      return 0; // Usuarios anónimos no tienen conteo en BD
    }

    return await messageService.countMessages(conversationId);
  },
};