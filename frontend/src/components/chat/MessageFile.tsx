"use client";

import { FileText, Download, File } from "lucide-react";
import Image from "next/image";
import { formatFileSize } from "@/lib/utils";

type MessageFileProps = {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
};

export function MessageFile({ fileUrl, fileName, fileType, fileSize }: MessageFileProps) {
  const isImage = fileType.startsWith("image/");
  const isPDF = fileType === "application/pdf";
  const isDocument = fileType.includes("document") || fileType.includes("word");

  // Si es imagen, mostrar preview con Next.js Image
  if (isImage) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <div className="relative w-full h-64">
            <Image
              src={fileUrl}
              alt={fileName}
              fill
              className="object-contain cursor-pointer hover:opacity-90 transition-opacity"
              unoptimized // ⚡ Necesario para imágenes externas de Supabase
            />
          </div>
        </a>
        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
          {fileName} {fileSize && `• ${formatFileSize(fileSize)}`}
        </div>
      </div>
    );
  }

  // Para otros archivos, mostrar como tarjeta descargable
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className="mt-2 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
    >
      {/* Icono según tipo */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
        {isPDF && <FileText size={20} className="text-red-600 dark:text-red-400" />}
        {isDocument && <FileText size={20} className="text-blue-600 dark:text-blue-400" />}
        {!isPDF && !isDocument && <File size={20} className="text-gray-600 dark:text-gray-400" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {fileName}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>

      {/* Icono de descarga */}
      <Download size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
    </a>
  );
}