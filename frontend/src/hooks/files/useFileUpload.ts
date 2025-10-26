"use client";

import { useState, useCallback, useEffect } from "react";
import { files } from "@/lib/api/files";
import { storage } from "@/lib/storage";
import type { FileData, FileUploadStatus } from "@/types/file";

export function useFileUpload(isAuthenticated: boolean) {
  const [uploadStatus, setUploadStatus] = useState<FileUploadStatus>({
    canUpload: true,
    current: 0,
    limit: isAuthenticated ? 4 : 2,
    remaining: isAuthenticated ? 4 : 2,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener estado de límites desde el backend (solo autenticados)
  const fetchUploadStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const status = await files.getFileUploadStatus();
      setUploadStatus(status);
    } catch (err) {
      console.error("Error al obtener estado de archivos:", err);
    }
  }, [isAuthenticated]);

  // Cargar estado inicial
  useEffect(() => {
    if (isAuthenticated) {
      fetchUploadStatus();
    } else {
      // Para anónimos, obtener de localStorage
      const count = storage.getFileCount();
      setUploadStatus({
        canUpload: count < 2,
        current: count,
        limit: 2,
        remaining: 2 - count,
      });
    }
  }, [isAuthenticated, fetchUploadStatus]);

  // Subir archivo
  const uploadFile = useCallback(
    async (file: File, conversationId: string): Promise<FileData | null> => {
      setUploading(true);
      setError(null);

      try {
        // Validación de tamaño (30MB)
        const MAX_SIZE = 30 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error("El archivo es demasiado grande. Máximo: 30MB");
        }

        let fileData: FileData;

        if (isAuthenticated) {
          // Usuarios autenticados: Subir a Supabase
          const response = await files.uploadFile(file, conversationId);

          // Actualizar estado de límites
          if (response.uploadStatus) {
            setUploadStatus(response.uploadStatus);
          }

          fileData = response.file;
        } else {
          // Usuarios anónimos: Guardar en localStorage como Base64
          const anonymousFile = await storage.uploadAnonymousFile(file, conversationId);

          // Actualizar estado local
          const count = storage.getFileCount();
          setUploadStatus({
            canUpload: count < 2,
            current: count,
            limit: 2,
            remaining: 2 - count,
          });

          // Convertir a formato FileData
          fileData = {
            url: anonymousFile.base64,
            name: anonymousFile.name,
            type: anonymousFile.type,
            size: anonymousFile.size,
            category: anonymousFile.type.startsWith("image/") ? "image" : "document",
          };
        }

        return fileData;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al subir archivo";
        setError(errorMsg);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [isAuthenticated]
  );

  // Resetear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadStatus,
    uploading,
    error,
    uploadFile,
    fetchUploadStatus,
    clearError,
  };
}