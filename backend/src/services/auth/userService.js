import { supabase, supabaseAdmin } from "../../config/database.js";
import { logger } from "../../utils/logger.js";

/**
 * Servicio de Usuario
 * Maneja operaciones relacionadas con el perfil del usuario
 */
export const userService = {
  /**
   * Obtiene el perfil del usuario
   */
  getUserProfile(user) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name,
      avatar: user.user_metadata?.avatar_url,
      createdAt: user.created_at,
    };
  },

  /**
   * Actualiza el perfil del usuario
   */
  async updateUserProfile(userId, updates) {
    logger.info(`📝 Actualizando perfil del usuario ${userId}:`, updates);

    // Preparar datos para actualizar en user_metadata
    const metadata = {};
    if (updates.fullName !== undefined) metadata.full_name = updates.fullName;
    if (updates.avatar !== undefined) metadata.avatar_url = updates.avatar;

    // Usar el Admin API de Supabase para actualizar el user_metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    );

    if (error) {
      logger.error("❌ Error actualizando perfil:", error);
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }

    logger.info("✅ Perfil actualizado exitosamente");

    return {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name,
      avatar: data.user.user_metadata?.avatar_url,
      createdAt: data.user.created_at,
    };
  },
};