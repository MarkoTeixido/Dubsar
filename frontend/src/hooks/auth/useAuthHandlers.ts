import { useCallback, useState } from "react";
import { auth } from "@/lib/api/auth";
import { storage } from "@/lib/storage";

export function useAuthHandlers(
  login: (email: string, password: string) => Promise<void>,
  register: (email: string, password: string, fullName: string) => Promise<void>,
  logout: () => Promise<void>,
  updateProfile: (data: { fullName?: string; avatar?: string }) => Promise<void>
) {
  const [showGoogleCallback, setShowGoogleCallback] = useState(false);

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
      // El modal se abrirá cuando Google redirija de vuelta
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
      storage.clearAnonymousConversations();
      storage.clearAnonymousFiles();
      window.location.href = "/";
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      throw error;
    }
  }, []);

  return {
    handleLogin,
    handleRegister,
    handleGoogleAuth,
    handleLogout,
    handleUpdateProfile,
    handleDeleteAccount,
    showGoogleCallback,
    setShowGoogleCallback,
  };
}