"use client";

import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

type CopyButtonProps = {
  text: string;
  index: number;
  isCopied: boolean;
  onCopy: (text: string, index: number) => void;
};

export function CopyButton({ text, index, isCopied, onCopy }: CopyButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      onClick={() => onCopy(text, index)}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      title="Copiar mensaje"
    >
      {isCopied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} className="text-gray-600 dark:text-gray-400" />
      )}
    </motion.button>
  );
}