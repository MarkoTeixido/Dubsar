import { useState, useCallback } from "react";

export function useChatFileAttachment() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setFileError(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
  }, []);

  const setError = useCallback((error: string | null) => {
    setFileError(error);
  }, []);

  return {
    selectedFile,
    fileError,
    handleFileSelect,
    handleRemoveFile,
    setFileError: setError,
  };
}