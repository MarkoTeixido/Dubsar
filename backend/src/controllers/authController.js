import { authService } from "../services/auth/authService.js";
import { userService } from "../services/auth/userService.js";
import { userDeletionService } from "../services/auth/userDeletionService.js";
import { passwordRecoveryService } from "../services/auth/passwordRecoveryService.js";

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP y delega la lógica a los servicios
 */
export const authController = {
  /**
   * Registro con email/password
   * POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;

      const result = await authService.registerUser(email, password, fullName);

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente. Revisa tu email para confirmar.",
        user: result.user,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Error al registrar",
        message: error.message,
      });
    }
  },

  /**
   * Login con email/password
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.loginUser(email, password);

      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        user: result.user,
        session: result.session,
      });
    } catch (error) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: error.message,
      });
    }
  },

  /**
   * Logout
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      let token = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      await authService.logoutUser(token);

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh token
   * POST /auth/refresh
   */
  async refreshToken(req, res, next) {
    try {
      const { refresh_token } = req.body;

      const session = await authService.refreshUserSession(refresh_token);

      res.json({
        success: true,
        session,
      });
    } catch (error) {
      return res.status(401).json({
        error: "Token inválido",
        message: error.message,
      });
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   * GET /auth/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = req.user; // Disponible gracias al middleware authenticateUser

      const profile = userService.getUserProfile(user);

      res.json({
        success: true,
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /auth/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, avatar } = req.body;

      const updatedUser = await userService.updateUserProfile(userId, {
        fullName,
        avatar,
      });

      res.json({
        success: true,
        message: "Perfil actualizado",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error al actualizar perfil",
        message: error.message,
      });
    }
  },

  /**
   * Iniciar OAuth con Google
   * GET /auth/google
   */
  async oauthGoogle(req, res, next) {
    try {
      const result = await authService.initiateGoogleOAuth();

      res.json({
        success: true,
        url: result.url,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Error OAuth",
        message: error.message,
      });
    }
  },

  /**
   * Eliminar cuenta del usuario y todos sus datos
   * DELETE /auth/account
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      await userDeletionService.deleteUserAccount(userId);

      res.json({
        success: true,
        message: "Tu cuenta ha sido eliminada exitosamente. Esperamos verte pronto.",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error al eliminar cuenta",
        message: error.message,
      });
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * POST /auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await passwordRecoveryService.sendPasswordResetEmail(email);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Error al procesar solicitud",
        message: error.message,
      });
    }
  },

  /**
  * Resetear contraseña con token
  * POST /auth/reset-password
  */
  async resetPassword(req, res, next) {
    try {
      const { newPassword } = req.body;
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Token no proporcionado",
          message: "Se requiere un token de recuperación válido",
        });
      }

      const token = authHeader.split(" ")[1];
      
      // Verificar token y obtener usuario
      const verifyResult = await passwordRecoveryService.verifyRecoveryToken(token);
      
      // Actualizar contraseña usando el userId
      const result = await passwordRecoveryService.updatePassword(newPassword, verifyResult.user.id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Error al resetear contraseña",
        message: error.message,
      });
    }
  },

  /**
   * Cambiar contraseña (requiere contraseña actual)
   * POST /auth/change-password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verificar que req.user existe (viene del middleware authenticateUser)
      if (!req.user || !req.user.id || !req.user.email) {
        return res.status(401).json({
          error: "No autenticado",
          message: "Debes iniciar sesión para cambiar tu contraseña",
        });
      }

      const userId = req.user.id;
      const userEmail = req.user.email;

      const result = await passwordRecoveryService.changePassword(
        currentPassword,
        newPassword,
        userId,
        userEmail
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        error: "Error al cambiar contraseña",
        message: error.message,
      });
    }
  },
};