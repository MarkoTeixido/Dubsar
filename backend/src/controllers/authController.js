import { authService } from "../services/auth/authService.js";
import { userService } from "../services/auth/userService.js";
import { userDeletionService } from "../services/auth/userDeletionService.js";

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
};