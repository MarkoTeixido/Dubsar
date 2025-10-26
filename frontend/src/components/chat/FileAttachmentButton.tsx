"use client";

import { useRef } from "react";
import { Paperclip } from "lucide-react";

type FileAttachmentButtonProps = {
  onFileSelect: (file: File) => void;
  disabled: boolean;
  hasFile: boolean;
};

export function FileAttachmentButton({
  onFileSelect,
  disabled,
  hasFile,
}: FileAttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
        className="hidden"
      />
      <button
        onClick={handleFileClick}
        type="button"
        disabled={disabled || hasFile}
        className="p-2 rounded-lg transition-all duration-200 
                   bg-gray-100 dark:bg-gray-700 
                   hover:bg-gray-200 dark:hover:bg-gray-600 
                   text-gray-700 dark:text-gray-200 
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   shadow-sm hover:shadow-md flex-shrink-0"
        aria-label="Adjuntar archivo"
      >
        <Paperclip size={20} />
      </button>
    </>
  );
}