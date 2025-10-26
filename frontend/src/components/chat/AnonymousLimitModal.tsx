"use client";

import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, MessagesSquare, Cloud, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type AnonymousLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  messageCount: number;
  conversationCount: number;
};

export function AnonymousLimitModal({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick,
  messageCount,
}: AnonymousLimitModalProps) {
  const isMessageLimit = messageCount >= 15;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Close Button */}
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors z-10"
                aria-label="Cerrar"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </Dialog.Close>

            {/* Header con Branding DUBSAR AI */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              {/* Logo DUBSAR AI */}
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

              {/* Icon */}
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={32} />
                </div>
              </div>

              {/* Title dentro del header */}
              <Dialog.Title className="text-xl font-bold text-center text-gray-900 dark:text-white font-quicksand">
                {isMessageLimit ? "Límite de mensajes alcanzado" : "Límite de conversaciones alcanzado"}
              </Dialog.Title>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Benefits */}
              <div className="mb-6 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  Con una cuenta obtienes:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                      <MessageSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Mensajes ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                      <MessagesSquare size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Conversaciones ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex-shrink-0">
                      <Cloud size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Historial guardado en la nube</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onRegisterClick();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Crear cuenta gratis
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onClose();
                    onLoginClick();
                  }}
                  className="w-full py-3 bg-white/60 hover:bg-white dark:bg-gray-800/60 dark:hover:bg-gray-700 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-medium rounded-xl border border-gray-200 dark:border-gray-700 transition-all"
                >
                  Ya tengo cuenta
                </motion.button>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}