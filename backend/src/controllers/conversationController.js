import { conversationBusinessService } from "../services/conversation/conversationBusinessService.js";

/**
 * Controlador de Conversaciones
 * Maneja las peticiones HTTP y delega la lógica a los servicios
 */
export const conversationController = {
  /**
   * Crear nueva conversación
   * POST /conversations
   */
  async create(req, res, next) {
    try {
      const { title } = req.body;
      const userId = req.user.id;

      const conversation = await conversationBusinessService.createConversation(
        userId,
        title
      );

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener todas las conversaciones del usuario
   * GET /conversations
   */
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;

      const conversations = await conversationBusinessService.getUserConversations(userId);

      res.json({
        success: true,
        count: conversations.length,
        conversations,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener mensajes de una conversación
   * GET /conversations/:id/messages
   */
  async getMessages(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const messages = await conversationBusinessService.getConversationMessages(id, userId);

      res.json({
        success: true,
        count: messages.length,
        messages,
      });
    } catch (error) {
      // Manejo específico de errores de acceso
      if (error.message.startsWith("FORBIDDEN:")) {
        return res.status(403).json({
          error: "Acceso denegado",
          message: error.message.replace("FORBIDDEN: ", ""),
        });
      }
      next(error);
    }
  },

  /**
   * Actualizar título de conversación
   * PUT /conversations/:id
   */
  async updateTitle(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      const conversation = await conversationBusinessService.updateConversationTitle(
        id,
        userId,
        title
      );

      res.json({
        success: true,
        conversation,
      });
    } catch (error) {
      // Manejo específico de errores de validación
      if (error.message.startsWith("VALIDATION:")) {
        return res.status(400).json({
          error: "Título inválido",
          message: error.message.replace("VALIDATION: ", ""),
        });
      }
      next(error);
    }
  },

  /**
   * Eliminar conversación
   * DELETE /conversations/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await conversationBusinessService.deleteConversation(id, userId);

      res.json({
        success: true,
        message: "Conversación eliminada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  },
};