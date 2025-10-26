"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type GoogleAuthCallbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function GoogleAuthCallbackModal({
  isOpen,
  onClose,
  onSuccess,
}: GoogleAuthCallbackModalProps) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleGoogleCallback = async () => {
      try {
        setStatus("loading");

        // Obtener tokens de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const error = hashParams.get("error") || queryParams.get("error");
        const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

        // ⚡ CAMBIO: Verificar primero si realmente hay datos de OAuth
        const hasOAuthData = accessToken || error;
        
        if (!hasOAuthData) {
          // Si no hay datos de OAuth, cerrar el modal silenciosamente
          console.log("No hay datos de OAuth en la URL, cerrando modal...");
          onClose();
          return;
        }

        // Si hay error en la URL
        if (error) {
          throw new Error(errorDescription || "Error en autenticación con Google");
        }

        // Si no hay token de acceso pero sí intentamos procesar OAuth
        if (!accessToken) {
          throw new Error("No se recibió token de acceso de Google");
        }

        // Guardar tokens en localStorage
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        // Limpiar la URL de los parámetros de OAuth
        window.history.replaceState({}, document.title, window.location.pathname);

        // Mostrar éxito
        setStatus("success");

        // Esperar un momento antes de cerrar
        setTimeout(() => {
          onSuccess();
        }, 1500);

      } catch (error) {
        console.error("Error en callback de Google OAuth:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
      }
    };

    handleGoogleCallback();
  }, [isOpen, onSuccess, onClose]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 sm:mx-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header con Branding DUBSAR AI */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-end justify-center gap-0.5 mb-4"
              >
                <span className="text-xl font-light tracking-[0.1em] text-gray-800 dark:text-white font-quicksand">
                  DUBSAR
                </span>
                <span className="text-blue-600 dark:text-blue-500 text-base font-extralight tracking-tight translate-y-0.5">
                  AI
                </span>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Conectando con Google
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                      Estamos completando tu inicio de sesión...
                    </p>
                  </motion.div>
                )}

                {status === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.5 }}
                    >
                      <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      ¡Inicio de sesión exitoso!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                      Bienvenido a DUBSAR AI
                    </p>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-8"
                  >
                    <XCircle className="h-16 w-16 text-red-500 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Error al conectar
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-6 px-4">
                      {errorMessage || "No se pudo completar el inicio de sesión con Google"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="w-full max-w-xs px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      Cerrar
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}