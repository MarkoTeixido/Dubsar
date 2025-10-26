import { useState, useCallback } from "react";

export function useModals() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [fileLimitModalOpen, setFileLimitModalOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  }, []);

  const openRegisterModal = useCallback(() => {
    setAuthModalTab("register");
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const openProfileModal = useCallback(() => {
    setProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setProfileModalOpen(false);
  }, []);

  const openLimitModal = useCallback(() => {
    setShowLimitModal(true);
  }, []);

  const closeLimitModal = useCallback(() => {
    setShowLimitModal(false);
  }, []);

  const openFileLimitModal = useCallback(() => {
    setFileLimitModalOpen(true);
  }, []);

  const closeFileLimitModal = useCallback(() => {
    setFileLimitModalOpen(false);
  }, []);

  // Abrir login desde otros modales
  const openLoginFromLimit = useCallback(() => {
    setShowLimitModal(false);
    setAuthModalTab("login");
    setAuthModalOpen(true);
  }, []);

  const openLoginFromFileLimit = useCallback(() => {
    setFileLimitModalOpen(false);
    setAuthModalTab("login");
    setAuthModalOpen(true);
  }, []);

  // Abrir registro desde otros modales
  const openRegisterFromLimit = useCallback(() => {
    setShowLimitModal(false);
    setAuthModalTab("register");
    setAuthModalOpen(true);
  }, []);

  const openRegisterFromFileLimit = useCallback(() => {
    setFileLimitModalOpen(false);
    setAuthModalTab("register");
    setAuthModalOpen(true);
  }, []);

  return {
    authModalOpen,
    authModalTab,
    profileModalOpen,
    showLimitModal,
    fileLimitModalOpen,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    openProfileModal,
    closeProfileModal,
    openLimitModal,
    closeLimitModal,
    openFileLimitModal,
    closeFileLimitModal,
    openLoginFromLimit,
    openLoginFromFileLimit,
    openRegisterFromLimit,
    openRegisterFromFileLimit,
    setShowLimitModal,
  };
}