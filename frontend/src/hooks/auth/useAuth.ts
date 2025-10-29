import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/api/auth';
import { storage } from '@/lib/storage';
import type { AuthState } from '@/types/user';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setAuthState({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const response = await auth.getProfile();
      
      setAuthState({
        user: response.user,
        session: {
          access_token: token,
          refresh_token: localStorage.getItem('refresh_token') || '',
          expires_at: 0,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error verificando auth:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      
      // Limpiar datos anónimos ANTES de actualizar el estado
      storage.resetMessageCount();
      storage.clearAnonymousConversations();
      storage.setCurrentAnonymousId('');
      
      setAuthState({
        user: response.user,
        session: response.session,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      await auth.register(email, password, fullName);
      
      // Limpiar datos anónimos ANTES de hacer login
      storage.resetMessageCount();
      storage.clearAnonymousConversations();
      storage.setCurrentAnonymousId('');
      
      // Después del registro, hacer login automático
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Limpiar conversaciones anónimas
      storage.clearAnonymousConversations();
      storage.resetMessageCount();
      storage.setCurrentAnonymousId('');
    }
  }, []);

  const updateProfile = useCallback(async (data: { fullName?: string; avatar?: string }) => {
    if (!authState.user) throw new Error('No hay usuario autenticado');

    console.log('📤 Enviando actualización de perfil al backend:', data);

    const response = await auth.updateProfile(data);
    
    console.log('✅ Perfil actualizado:', response);

    // Actualizar estado local con la respuesta del servidor
    setAuthState(prev => ({
      ...prev,
      user: response.user
    }));

    return response.user;
  }, [authState.user]);

    const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await auth.forgotPassword(email);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (newPassword: string, token: string) => {
    try {
      const response = await auth.resetPassword(newPassword, token);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    forgotPassword,
    resetPassword,
  };
}