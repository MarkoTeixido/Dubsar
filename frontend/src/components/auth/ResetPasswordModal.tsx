"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useResetPasswordForm } from "@/hooks/auth/useResetPasswordForm";

type ResetPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSubmit: (newPassword: string, token: string) => Promise<void>;
  onSuccess?: () => void;
};

export function ResetPasswordModal({ isOpen, onClose, token, onSubmit, onSuccess }: ResetPasswordModalProps) {
  const [tokenError, setTokenError] = useState(false);
  const { formData, updateField, loading, error, success, handleSubmit, reset } = useResetPasswordForm();

  useEffect(() => {
    if (isOpen && !token) {
      setTokenError(true);
    } else if (isOpen && token) {
      setTokenError(false);
    }
  }, [isOpen, token]);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const result = await handleSubmit(async (newPassword) => {
      await onSubmit(newPassword, token);
    });

    if (result) {
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 2000);
    }
  };

  const handleClose = () => {
    reset();
    setTokenError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
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

            {/* Header */}
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

              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white text-center font-quicksand">
                {tokenError ? "Link Inválido" : "Nueva Contraseña"}
              </Dialog.Title>
              {!tokenError && (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                  Ingresa tu nueva contraseña
                </p>
              )}
            </div>

            {/* Form Container */}
            <div className="p-6">
              {tokenError ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertCircle className="text-red-600 dark:text-red-400" size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Link inválido o expirado
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Entendido
                  </button>
                </motion.div>
              ) : success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      ¡Contraseña actualizada!
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={onFormSubmit}
                  className="space-y-4"
                >
                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => updateField("newPassword", e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar contraseña"
                    )}
                  </motion.button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}