import { supabase } from "../../config/database.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Servicio de Autenticación
 * Maneja toda la lógica de negocio relacionada con autenticación
 */
export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async registerUser(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
        },
      },
    });

    if (error) {
      throw new Error(`Error al registrar: ${error.message}`);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
      },
    };
  },

  /**
   * Inicia sesión con email y contraseña
   */
  async loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Email o contraseña incorrectos");
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name,
        avatar: data.user.user_metadata?.avatar_url,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  },

  /**
   * Cierra sesión del usuario
   */
  async logoutUser(token) {
    if (token) {
      await supabase.auth.signOut(token);
    }
  },

  /**
   * Refresca el token de sesión
   */
  async refreshUserSession(refreshToken) {
    if (!refreshToken) {
      throw new Error("Se necesita un refresh token");
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error("No se pudo refrescar la sesión");
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
    };
  },

  /**
   * Inicia OAuth con Google
   */
  async initiateGoogleOAuth() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ⚡ CAMBIO: Redirigir a home en lugar de /auth/callback
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}`,
      },
    });

    if (error) {
      throw new Error(`Error OAuth: ${error.message}`);
    }

    return {
      url: data.url,
    };
  },

  /**
   * Extrae el token del header Authorization
   */
  extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  },

  /**
   * Verifica un token JWT y retorna el usuario
   */
  async verifyToken(token) {
    if (!token) {
      throw new Error("Token no proporcionado");
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new Error("Token inválido o expirado");
    }

    return user;
  },

  /**
   * Verifica token de manera opcional (no lanza error si falla)
   */
  async verifyTokenOptional(token) {
    if (!token) {
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      return user || null;
    } catch (error) {
      return null;
    }
  },
};