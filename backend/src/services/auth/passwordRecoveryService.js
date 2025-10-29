import { supabase, supabaseAdmin } from "../../config/database.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Servicio de Recuperación de Contraseña
 * Maneja la lógica de negocio para resetear contraseñas
 */
export const passwordRecoveryService = {
  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordResetEmail(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}`,
    });

    if (error) {
      throw new Error(`Error al enviar email: ${error.message}`);
    }

    return {
      message: "Si el correo existe, recibirás un email con instrucciones para resetear tu contraseña.",
    };
  },

  /**
   * Actualiza la contraseña del usuario (sin verificar la actual)
   * Usado cuando se resetea por email
   */
  async updatePassword(newPassword, token) {
    // Usar el token proporcionado para actualizar la contraseña
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      token, // Esto necesita el userId, no el token
      { password: newPassword }
    );

    if (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }

    return {
      message: "Contraseña actualizada exitosamente",
    };
  },

  /**
   * Cambia la contraseña verificando la actual
   * Usado desde el perfil del usuario
   */
  async changePassword(currentPassword, newPassword, userId, userEmail) {
    // Verificar la contraseña actual intentando hacer login
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (loginError) {
      throw new Error("La contraseña actual es incorrecta");
    }

    // Si la verificación fue exitosa, actualizar la contraseña usando Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      throw new Error(`Error al actualizar contraseña: ${updateError.message}`);
    }

    return {
      message: "Contraseña cambiada exitosamente",
    };
  },

  /**
   * Verifica si el token de recuperación es válido
   */
  async verifyRecoveryToken(token) {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error("Token inválido o expirado");
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  },
};