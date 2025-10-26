import { useCallback } from "react";
import { auth } from "@/lib/api/auth";
import { storage } from "@/lib/storage";

export function useAuthHandlers(
  login: (email: string, password: string) => Promise<void>,
  register: (email: string, password: string, fullName: string) => Promise<void>,
  logout: () => Promise<void>,
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>
) {
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
    },
    [login]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, fullName: string) => {
      await register(email, password, fullName);
    },
    [register]
  );

  const handleGoogleAuth = useCallback(async () => {
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      console.error("Error con Google OAuth:", error);
      alert("Error al conectar con Google. Intenta de nuevo.");
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.reload();
  }, [logout]);

  const handleUpdateProfile = useCallback(
    async (data: { fullName?: string; avatar?: string }) => {
      await updateProfile(data);
    },
    [updateProfile]
  );

  const handleDeleteAccount = useCallback(async () => {
    try {
      await auth.deleteAccount();

      // Limpiar todo el storage local
      storage.clearAnonymousConversations();
      storage.clearAnonymousFiles();

      // Recargar página para limpiar estado
      window.location.href = "/";
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      throw error; // Propagar error para mostrarlo en el modal
    }
  }, []);

  return {
    handleLogin,
    handleRegister,
    handleGoogleAuth,
    handleLogout,
    handleUpdateProfile,
    handleDeleteAccount,
  };
}