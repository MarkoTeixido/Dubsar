"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { ShareChatModal } from "./ShareChatModal";

type ShareChatButtonProps = {
  conversationId: string;
  conversationTitle?: string;
};

export function ShareChatButton({ conversationId, conversationTitle }: ShareChatButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Compartir conversación"
      >
        <Share2 size={20} className="text-gray-700 dark:text-gray-300" />
      </motion.button>

      <ShareChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        conversationId={conversationId}
        conversationTitle={conversationTitle || "Conversación con Dubsar AI"}
      />
    </>
  );
}