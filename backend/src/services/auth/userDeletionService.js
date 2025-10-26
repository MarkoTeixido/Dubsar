import { supabase, supabaseAdmin } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

/**
 * Servicio de Eliminación de Usuario
 * Maneja el proceso complejo de eliminar una cuenta y todos sus datos
 */
export const userDeletionService = {
  /**
   * Elimina completamente la cuenta de un usuario y todos sus datos
   */
  async deleteUserAccount(userId) {
    logger.info(`🗑️ Iniciando eliminación de cuenta del usuario: ${userId}`);

    try {
      // Paso 1: Eliminar archivos de storage
      await this.deleteUserFiles(userId);

      // Paso 2: Eliminar conversaciones (los mensajes se eliminan por CASCADE)
      await this.deleteUserConversations(userId);

      // Paso 3: Eliminar usuario de Auth
      await this.deleteAuthUser(userId);

      logger.info(`✅ Cuenta eliminada exitosamente: ${userId}`);
    } catch (error) {
      logger.error(`❌ Error al eliminar cuenta ${userId}:`, error);
      throw new Error(`Error al eliminar cuenta: ${error.message}`);
    }
  },

  /**
   * Obtiene todas las conversaciones de un usuario
   */
  async getUserConversations(userId) {
    const { data, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId);

    if (error) {
      logger.error("❌ Error al obtener conversaciones:", error);
      throw error;
    }

    logger.info(`📊 Conversaciones encontradas: ${data?.length || 0}`);
    return data || [];
  },

  /**
   * Elimina todos los archivos de storage asociados al usuario
   */
  async deleteUserFiles(userId) {
    const conversations = await this.getUserConversations(userId);

    if (conversations.length === 0) {
      logger.info(`📊 No hay archivos para eliminar del usuario ${userId}`);
      return;
    }

    for (const conv of conversations) {
      try {
        await this.deleteConversationFiles(conv.id);
      } catch (error) {
        logger.warn(`⚠️ Error procesando archivos de conversación ${conv.id}:`, error);
        // Continuar con la siguiente conversación
      }
    }
  },

  /**
   * Elimina archivos de una conversación específica
   */
  async deleteConversationFiles(conversationId) {
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("chat-files")
      .list(conversationId);

    if (listError) {
      logger.warn(`⚠️ Error listando archivos de ${conversationId}:`, listError);
      return;
    }

    if (!files || files.length === 0) {
      return;
    }

    const filePaths = files.map((f) => `${conversationId}/${f.name}`);
    const { error: removeError } = await supabaseAdmin.storage
      .from("chat-files")
      .remove(filePaths);

    if (removeError) {
      logger.error(`⚠️ Error eliminando archivos de ${conversationId}:`, removeError);
      throw removeError;
    }

    logger.info(`🗑️ Eliminados ${filePaths.length} archivos de conversación ${conversationId}`);
  },

  /**
   * Elimina todas las conversaciones de un usuario
   */
  async deleteUserConversations(userId) {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId);

    if (error) {
      logger.warn("⚠️ Error al eliminar conversaciones:", error);
      throw error;
    }

    logger.info(`🗑️ Conversaciones eliminadas del usuario ${userId}`);
  },

  /**
   * Elimina el usuario de Supabase Auth
   */
  async deleteAuthUser(userId) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      logger.error("❌ Error al eliminar usuario de Auth:", error);
      throw error;
    }

    logger.info(`🗑️ Usuario eliminado de Auth: ${userId}`);
  },
};