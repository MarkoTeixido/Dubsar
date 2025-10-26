import { chatService } from "../services/chat/chatService.js";
import { messageParserService } from "../services/chat/messageParserService.js";
import { streamingService } from "../services/chat/streamingService.js";
import { geminiService } from "../services/integrations/geminiService.js";

/**
 * Controlador de Chat
 * Maneja las peticiones HTTP del chat y delega la lógica a los servicios
 */
export const chatController = {
  /**
   * Chat con streaming (Server-Sent Events)
   * POST /chat/stream
   */
  async streamChat(req, res, next) {
    try {
      const { message, conversationId, fileData } = req.body;
      const userId = req.user?.id;

      // Validar acceso
      await chatService.validateAccess(conversationId, userId);

      // Configurar SSE
      streamingService.setupSSE(res);

      // Guardar mensaje del usuario
      await chatService.saveUserMessage(userId, conversationId, message, fileData);

      // Obtener historial
      const geminiHistory = await chatService.getFormattedHistory(userId, conversationId, true);

      // Preparar partes del mensaje (texto + imagen)
      const messageParts = messageParserService.prepareMessageParts(message, fileData);

      // Procesar stream
      await streamingService.processStream(
        res,
        conversationId,
        messageParts,
        geminiHistory,
        userId
      );
    } catch (error) {
      console.error("❌ Error en streamChat:", error);

      // Si aún no se enviaron headers, enviar error HTTP
      if (!res.headersSent) {
        return res.status(error.message.includes("permiso") ? 403 : 500).json({
          error: "Error en streaming",
          message: error.message,
        });
      }

      // Si ya se enviaron headers, enviar error por SSE
      streamingService.sendChunk(res, { error: error.message });
      res.end();
    }
  },

  /**
   * Chat sin streaming (respuesta completa)
   * POST /chat
   */
  async chat(req, res, next) {
    try {
      const { message, conversationId, fileData } = req.body;
      const userId = req.user?.id;

      // Validar acceso
      await chatService.validateAccess(conversationId, userId);

      // Guardar mensaje del usuario
      await chatService.saveUserMessage(userId, conversationId, message, fileData);

      // Obtener historial
      const geminiHistory = await chatService.getFormattedHistory(userId, conversationId, true);

      // Preparar partes del mensaje (texto + imagen)
      const messageParts = messageParserService.prepareMessageParts(message, fileData);

      // Generar respuesta completa (sin streaming)
      const responseText = await geminiService.generateResponseWithParts(
        messageParts,
        geminiHistory
      );

      // Guardar respuesta del bot
      await chatService.saveBotResponse(userId, conversationId, responseText);

      // Obtener conteo de mensajes
      const messageCount = await chatService.getMessageCount(userId, conversationId);
      console.log(`💬 [${conversationId}] Total de mensajes: ${messageCount}`);

      res.json({
        success: true,
        response: responseText,
        conversationId,
      });
    } catch (error) {
      const statusCode = error.message.includes("permiso") ? 403 : 500;
      return res.status(statusCode).json({
        error: "Error en chat",
        message: error.message,
      });
    }
  },
};