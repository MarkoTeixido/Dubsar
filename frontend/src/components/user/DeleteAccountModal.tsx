"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type DeleteAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName?: string;
};

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      await onConfirm();
      // No cerramos el modal aquí, la página se recargará
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al eliminar cuenta";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] p-6"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Title */}
            <Dialog.Title className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2 font-quicksand">
              ¿Eliminar tu cuenta?
            </Dialog.Title>

            {/* Message */}
            <div className="text-center text-gray-600 dark:text-gray-400 mb-6 space-y-3">
              <p className="font-medium">
                {userName ? `${userName}, ` : ""}esta acción es <strong className="text-red-600 dark:text-red-400">permanente e irreversible</strong>.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-left">
                <p className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Se eliminarán permanentemente:
                </p>
                <ul className="space-y-1 text-red-800 dark:text-red-300">
                  <li>• Tu perfil y datos personales</li>
                  <li>• Todas tus conversaciones</li>
                  <li>• Todos los mensajes guardados</li>
                  <li>• Todos los archivos subidos</li>
                </ul>
              </div>

              <p className="text-sm">
                ¿Estás completamente seguro de que deseas continuar?
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Eliminando..." : "Sí, eliminar cuenta"}
              </motion.button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}