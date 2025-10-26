"use client";

import { useState, useEffect } from "react";

export function useGoogleOAuthCallback() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Detectar si venimos de Google OAuth
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    // ⚡ CAMBIO: Solo abrir si realmente tenemos tokens o error de OAuth
    const hasAccessToken = hashParams.has("access_token") || queryParams.has("access_token");
    const hasOAuthError = hashParams.has("error") || queryParams.has("error");
    
    // Solo mostrar modal si venimos de Google (con token o con error)
    if (hasAccessToken || hasOAuthError) {
      setShowModal(true);
    }
  }, []);

  const handleSuccess = () => {
    setShowModal(false);
    // Recargar la página para actualizar el estado de autenticación
    window.location.reload();
  };

  const handleClose = () => {
    setShowModal(false);
    // Limpiar la URL si cerramos manualmente
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return {
    showModal,
    handleSuccess,
    handleClose,
  };
}