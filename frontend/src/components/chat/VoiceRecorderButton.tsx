"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, AlertCircle, X } from "lucide-react";

type VoiceRecorderButtonProps = {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  recordingTime: number;
  onToggle: () => void;
  onClearError: () => void;
  formatTime: (seconds: number) => string;
};

export function VoiceRecorderButton({
  isListening,
  isSupported,
  error,
  recordingTime,
  onToggle,
  onClearError,
  formatTime,
}: VoiceRecorderButtonProps) {
  if (!isSupported) return null;

  return (
    <>
      {/* Contador de tiempo */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-gray-500 dark:text-gray-400 font-mono text-sm tabular-nums self-center"
          >
            {formatTime(recordingTime)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de voz */}
      <button
        key={`mic-${isListening}-${!!error}`}
        onClick={onToggle}
        type="button"
        className={`p-2 rounded-lg relative flex-shrink-0 transition-all duration-200
          ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
              : error
                ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 ring-2 ring-red-500/50 hover:bg-gray-200 dark:hover:bg-gray-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
          }`}
        aria-label={isListening ? "Detener grabación" : "Iniciar grabación de voz"}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="recording"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <MicOff size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Mic size={20} />
            </motion.div>
          )}
        </AnimatePresence>

        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-red-400 opacity-50 -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </button>

      {/* Error de voz */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 flex items-center justify-center"
          >
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
              <button
                onClick={onClearError}
                className="ml-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded p-0.5 transition-colors"
                aria-label="Cerrar mensaje"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mensaje de grabación */}
      <AnimatePresence>
        {isListening && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-0 right-0 mb-2 text-xs text-gray-500 dark:text-gray-400 text-center"
          >
            Grabando... (Haz click de nuevo para detener)
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
}