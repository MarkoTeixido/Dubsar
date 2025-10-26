"use client";

import { motion } from "framer-motion";
import { X, FileText, File, Image as ImageIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

type FilePreviewProps = {
  file: File;
  onRemove: () => void;
};

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";
  const isDocument = file.type.includes("document") || file.type.includes("word");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl p-3 shadow-lg"
    >
      {/* Icono según tipo */}
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        {isImage && <ImageIcon size={24} className="text-blue-600 dark:text-blue-400" />}
        {isPDF && <FileText size={24} className="text-red-600 dark:text-red-400" />}
        {isDocument && <FileText size={24} className="text-blue-600 dark:text-blue-400" />}
        {!isImage && !isPDF && !isDocument && <File size={24} className="text-gray-600 dark:text-gray-400" />}
      </div>

      {/* Info del archivo */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Quitar archivo"
      >
        <X size={20} className="text-gray-600 dark:text-gray-400" />
      </button>
    </motion.div>
  );
}