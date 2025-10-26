"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileWarning, Upload } from "lucide-react";

type FileLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  currentFiles: number;
  limit: number;
  isAuthenticated: boolean;
};

export function FileLimitModal({
  isOpen,
  onClose,
  onLoginClick,
  onRegisterClick,
  currentFiles,
  limit,
  isAuthenticated,
}: FileLimitModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <FileWarning size={32} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            Límite de archivos alcanzado
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {isAuthenticated ? (
              <>
                Has alcanzado el límite de <strong>{limit} archivos</strong> en todas tus
                conversaciones ({currentFiles}/{limit}).
                <br />
                <br />
                Para subir más archivos, elimina conversaciones que contengan archivos adjuntos.
              </>
            ) : (
              <>
                Has alcanzado el límite de <strong>{limit} archivos</strong> como usuario anónimo
                ({currentFiles}/{limit}).
                <br />
                <br />
                ¡Regístrate gratis para subir hasta <strong>4 archivos</strong>!
              </>
            )}
          </p>

          {/* Stats */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Archivos usados</span>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {currentFiles} / {limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${(currentFiles / limit) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated ? (
            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              Entendido
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={onRegisterClick}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                Registrarme gratis
              </button>
              <button
                onClick={onLoginClick}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-xl transition-colors"
              >
                Ya tengo cuenta
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}