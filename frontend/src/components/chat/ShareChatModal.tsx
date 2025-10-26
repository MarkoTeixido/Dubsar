"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X as CloseIcon, Linkedin, Check, Copy } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

type ShareChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
};

export function ShareChatModal({
  isOpen,
  onClose,
  conversationId,
  conversationTitle,
}: ShareChatModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${conversationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareX = () => {
    const text = `Mira mi conversación con Dubsar AI: ${conversationTitle}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Close Button */}
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                aria-label="Cerrar"
              >
                <CloseIcon size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </Dialog.Close>

            {/* Header con Branding */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-6 pt-6 pb-8 border-b border-gray-200 dark:border-gray-700">
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

              {/* Title */}
              <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1 font-quicksand px-8">
                Compartir conversación
              </Dialog.Title>

              {/* Conversation Title */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                &ldquo;{conversationTitle}&rdquo;
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Share URL with Copy Button */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Enlace de la conversación:
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 text-sm bg-transparent text-gray-700 dark:text-gray-300 outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <Check size={16} className="text-white" />
                    ) : (
                      <Copy size={16} className="text-white" />
                    )}
                  </motion.button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-600 dark:text-green-400 mt-1 text-center"
                  >
                    ✓ Enlace copiado al portapapeles
                  </motion.p>
                )}
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                  O compartir en redes sociales:
                </p>
                
                <div className="flex justify-center gap-4">
                  {/* X (Twitter) */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareX}
                    className="w-12 h-12 rounded-full bg-black hover:bg-gray-900 dark:bg-white dark:hover:bg-gray-200 transition-colors flex items-center justify-center"
                    title="Compartir en X"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-6 h-6 fill-white dark:fill-black"
                      aria-label="X"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </motion.button>

                  {/* LinkedIn */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareLinkedIn}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center"
                    title="Compartir en LinkedIn"
                  >
                    <Linkedin size={24} className="text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}