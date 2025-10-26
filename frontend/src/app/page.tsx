"use client";

import { useEffect } from "react";
import { AppHeader } from "@/components/layout/Header";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { ConversationSidebar } from "@/components/sidebar/ConversationSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileModal } from "@/components/user/ProfileModal";
import { AnonymousLimitModal } from "@/components/chat/AnonymousLimitModal";
import { FileLimitModal } from "@/components/chat/FileLimitModal";
import { GoogleAuthCallbackModal } from "@/components/auth/GoogleAuthCallbackModal";
import { useChat } from "@/hooks/chat/useChat";
import { useConversations } from "@/hooks/conversations/useConversations";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAnonymousChat } from "@/hooks/chat/useAnonymousChat";
import { useFileUpload } from "@/hooks/files/useFileUpload";
import { useDarkMode } from "@/hooks/ui/useDarkMode";
import { useModals } from "@/hooks/ui/useModals";
import { useAuthHandlers } from "@/hooks/auth/useAuthHandlers";
import { useGoogleOAuthCallback } from "@/hooks/auth/useGoogleOAuthCallback";

export default function ChatPage() {
  // Dark mode
  const { darkMode, mounted, toggleDarkMode } = useDarkMode();

  // Auth
  const { user, isAuthenticated, isLoading: authLoading, login, register, logout, updateProfile } = useAuth();

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
      <div className="flex h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500">
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
        <SidebarInset className="flex flex-col">
          {/* Header */}
          <AppHeader
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            isAuthenticated={isAuthenticated}
            currentConversationId={currentConversationId}
            conversationTitle={conversations.find((c) => c.id === currentConversationId)?.title}
            onLoginClick={modals.openLoginModal}
            onRegisterClick={modals.openRegisterModal}
          />

          {/* Chat Area */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
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

            {/* Indicadores */}
            {!isAuthenticated && uploadStatus.remaining <= 1 && (
              <div className="pb-2 text-sm text-gray-500 dark:text-gray-400">
                Te queda <span className="font-bold text-orange-500">{uploadStatus.remaining}</span> archivo
                disponible
              </div>
            )}

            {!isAuthenticated && remainingMessages <= 5 && (
              <div className="pb-4 text-sm text-gray-500 dark:text-gray-400">
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
      </div>
    </SidebarProvider>
  );
}