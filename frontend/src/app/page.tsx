"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { AppHeader } from "@/components/layout/Header";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ConversationSidebar } from "@/components/sidebar/ConversationSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useChat } from "@/hooks/chat/useChat";
import { useConversations } from "@/hooks/conversations/useConversations";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAnonymousChat } from "@/hooks/chat/useAnonymousChat";
import { useFileUpload } from "@/hooks/files/useFileUpload";
import { useDarkMode } from "@/hooks/ui/useDarkMode";
import { useModals } from "@/hooks/ui/useModals";
import { useAuthHandlers } from "@/hooks/auth/useAuthHandlers";
import { useGoogleOAuthCallback } from "@/hooks/auth/useGoogleOAuthCallback";

// Carga dinámica de modales para reducir bundle inicial
const AuthModal = dynamic(() => import("@/components/auth/AuthModal").then(mod => ({ default: mod.AuthModal })), {
  ssr: false,
});

const ProfileModal = dynamic(() => import("@/components/user/ProfileModal").then(mod => ({ default: mod.ProfileModal })), {
  ssr: false,
  loading: () => null
});

const AnonymousLimitModal = dynamic(() => import("@/components/chat/AnonymousLimitModal").then(mod => ({ default: mod.AnonymousLimitModal })), {
  ssr: false,
});

const FileLimitModal = dynamic(() => import("@/components/chat/FileLimitModal").then(mod => ({ default: mod.FileLimitModal })), {
  ssr: false,
});

const GoogleAuthCallbackModal = dynamic(() => import("@/components/auth/GoogleAuthCallbackModal").then(mod => ({ default: mod.GoogleAuthCallbackModal })), {
  ssr: false,
});

const ResetPasswordModal = dynamic(() => import("@/components/auth/ResetPasswordModal").then(mod => ({ default: mod.ResetPasswordModal })), {
  ssr: false,
});

export default function ChatPage() {
  // Dark mode
  const { darkMode, mounted, toggleDarkMode } = useDarkMode();

  // Auth
  const { user, isAuthenticated, isLoading: authLoading, login, register, logout, updateProfile, forgotPassword, resetPassword } = useAuth();

  // Auth handlers
  const {
    handleLogin,
    handleRegister,
    handleGoogleAuth,
    handleLogout,
    handleUpdateProfile,
    handleDeleteAccount,
  } = useAuthHandlers(login, register, logout, updateProfile);

  // Google OAuth Callback
  const { showModal: showGoogleCallback, handleSuccess: handleGoogleSuccess, handleClose: handleGoogleClose } = useGoogleOAuthCallback();

  // Modales
  const modals = useModals();

  // Reset Password Modal
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  // Anonymous chat limits
  const {
    messageCount,
    conversationCount,
    showLimitModal,
    setShowLimitModal,
    incrementMessageCount,
    incrementConversationCount,
    checkConversationLimit,
    remainingMessages,
  } = useAnonymousChat();

  // File upload
  const { uploadStatus, error: uploadError, fetchUploadStatus } = useFileUpload(isAuthenticated);

  // Conversations
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createConversation,
    deleteConversation,
    updateConversationTitle,
    loading: conversationsLoading,
  } = useConversations(isAuthenticated);

  // Chat
  const {
    messages,
    input,
    loading,
    selectedFile,
    fileError,
    setInput,
    sendMessage,
    copyToClipboard,
    copiedIndex,
    handleFileSelect,
    handleRemoveFile,
  } = useChat(
    currentConversationId,
    isAuthenticated,
    user?.fullName,
    isAuthenticated ? undefined : incrementMessageCount
  );

  // 🔧 FIX: Calcular altura dinámica del viewport en mobile
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Sincronizar modal de límite anónimo con useModals
  useEffect(() => {
    if (showLimitModal) {
      modals.openLimitModal();
      setShowLimitModal(false);
    }
  }, [showLimitModal, modals, setShowLimitModal]);

  // Cargar estado de archivos al montar
  useEffect(() => {
    if (mounted && !authLoading) {
      fetchUploadStatus();
    }
  }, [mounted, authLoading, isAuthenticated, fetchUploadStatus]);

  // Detectar token de recuperación de contraseña en el hash
  useEffect(() => {
    if (mounted && !authLoading) {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get("type");
      
      // Supabase envía type=recovery en el hash cuando es reset password
      if (type === "recovery") {
        setShowResetPasswordModal(true);
      }
    }
  }, [mounted, authLoading]);

  // Crear primera conversación si no hay ninguna (solo para anónimos)
  useEffect(() => {
    if (
      mounted &&
      !authLoading &&
      !isAuthenticated &&
      !currentConversationId &&
      conversations.length === 0 &&
      !conversationsLoading
    ) {
      createConversation();
    }
  }, [mounted, authLoading, isAuthenticated, currentConversationId, conversations.length, conversationsLoading, createConversation]);

  // Handler para selección de archivo con validación de límites
  const handleFileSelectWithLimit = (file: File) => {
    if (!uploadStatus.canUpload) {
      modals.openFileLimitModal();
      return;
    }
    handleFileSelect(file);
  };

  // Handler para crear conversación con límite
  const handleCreateConversation = async () => {
    if (!isAuthenticated) {
      const canCreate = checkConversationLimit();
      if (!canCreate) return;

      incrementConversationCount();
    }

    await createConversation();
  };

  // Handler para login con cierre de modal
  const handleLoginWithClose = async (email: string, password: string) => {
    await handleLogin(email, password);
    modals.closeAuthModal();
  };

  // Handler para registro con cierre de modal
  const handleRegisterWithClose = async (email: string, password: string, fullName: string) => {
    await handleRegister(email, password, fullName);
    modals.closeAuthModal();
  };

  // Handler para forgot password
  const handleForgotPassword = async (email: string) => {
    await forgotPassword(email);
  };

  // Loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      {/* 🔧 FIX: Usar clase personalizada para altura dinámica */}
      <div className="flex mobile-vh-full w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-hidden">
        {/* Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={deleteConversation}
          onUpdateTitle={updateConversationTitle}
          user={user}
          onLogout={handleLogout}
          onOpenProfile={modals.openProfileModal}
          onLoginClick={modals.openLoginModal}
          onRegisterClick={modals.openRegisterModal}
        />

        {/* Main Content */}
        <SidebarInset className="flex flex-col min-h-0 flex-1">
          {/* Header - 🔧 FIX: Altura fija y no shrink */}
          <div className="flex-shrink-0">
            <AppHeader
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              isAuthenticated={isAuthenticated}
              currentConversationId={currentConversationId}
              conversationTitle={conversations.find((c) => c.id === currentConversationId)?.title}
              onLoginClick={modals.openLoginModal}
              onRegisterClick={modals.openRegisterModal}
            />
          </div>

          {/* Chat Area - 🔧 FIX: Flex-1 con min-height 0 para permitir scroll interno */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden">
            <ChatContainer
              messages={messages}
              input={input}
              loading={loading}
              onInputChange={setInput}
              onSend={sendMessage}
              onCopy={copyToClipboard}
              copiedIndex={copiedIndex}
              onFileSelect={handleFileSelectWithLimit}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              fileError={fileError || uploadError}
            />

            {/* Indicadores - 🔧 FIX: Posicionados absolutamente para no afectar el layout */}
            {!isAuthenticated && uploadStatus.remaining <= 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
                Te queda <span className="font-bold text-orange-500">{uploadStatus.remaining}</span> archivo
                disponible
              </div>
            )}

            {!isAuthenticated && remainingMessages <= 5 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
                Te quedan <span className="font-bold text-blue-500">{remainingMessages}</span> mensajes
              </div>
            )}
          </div>
        </SidebarInset>

        {/* Modales */}
        <AuthModal
          isOpen={modals.authModalOpen}
          onClose={modals.closeAuthModal}
          defaultTab={modals.authModalTab}
          onLoginSuccess={handleLoginWithClose}
          onRegisterSuccess={handleRegisterWithClose}
          onGoogleAuth={handleGoogleAuth}
          onForgotPassword={handleForgotPassword}
        />

        {user && (
          <ProfileModal
            isOpen={modals.profileModalOpen}
            onClose={modals.closeProfileModal}
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        <AnonymousLimitModal
          isOpen={modals.showLimitModal}
          onClose={modals.closeLimitModal}
          onLoginClick={modals.openLoginFromLimit}
          onRegisterClick={modals.openRegisterFromLimit}
          messageCount={messageCount}
          conversationCount={conversationCount}
        />

        <FileLimitModal
          isOpen={modals.fileLimitModalOpen}
          onClose={modals.closeFileLimitModal}
          onLoginClick={modals.openLoginFromFileLimit}
          onRegisterClick={modals.openRegisterFromFileLimit}
          currentFiles={uploadStatus.current}
          limit={uploadStatus.limit}
          isAuthenticated={isAuthenticated}
        />

        {/* Modal de Callback de Google OAuth */}
        <GoogleAuthCallbackModal
          isOpen={showGoogleCallback}
          onClose={handleGoogleClose}
          onSuccess={handleGoogleSuccess}
        />

        {/* Modal de Reset Password */}
        <ResetPasswordModal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          onSubmit={async (newPassword, token) => {
            await resetPassword(newPassword, token);
          }}
          onSuccess={() => {
            // Abrir modal de login después de resetear
            setTimeout(() => {
              modals.openLoginModal();
            }, 500);
          }}
        />
      </div>
    </SidebarProvider>
  );
}