"use client";

import { Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceRecorderButton } from "./VoiceRecorderButton";
import { FileAttachmentButton } from "./FileAttachmentButton";
import { FilePreview } from "./FilePreview";
import { useChatInput } from "@/hooks/chat/useChatInput";
import { useVoiceRecording } from "@/hooks/chat/useVoiceRecording";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
  fileError?: string;
};

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  onFileSelect,
  selectedFile,
  onRemoveFile,
  fileError,
}: ChatInputProps) {
  const { textareaRef, handleKeyDown } = useChatInput(value);
  const voiceRecording = useVoiceRecording(value, onChange);

  return (
    <div className="p-3 md:p-4 space-y-2 relative">
      {/* PREVIEW DE ARCHIVO */}
      <AnimatePresence>
        {selectedFile && (
          <FilePreview file={selectedFile} onRemove={onRemoveFile || (() => {})} />
        )}
      </AnimatePresence>

      {/* Input principal */}
      <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 shadow-lg focus-within:border-blue-500 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, onSend, disabled)}
          placeholder={voiceRecording.isListening ? "Escuchando..." : "Escribe tu mensaje..."}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:opacity-50 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent py-1 text-sm md:text-base min-w-0"
          style={{ maxHeight: "120px" }}
        />

        {/* Contenedor de botones */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* BOTÓN DE ADJUNTAR ARCHIVO */}
          {onFileSelect && (
            <FileAttachmentButton
              onFileSelect={onFileSelect}
              disabled={disabled}
              hasFile={!!selectedFile}
            />
          )}

          {/* BOTÓN DE VOZ */}
          <VoiceRecorderButton
            isListening={voiceRecording.isListening}
            isSupported={voiceRecording.isSupported}
            error={voiceRecording.error}
            recordingTime={voiceRecording.recordingTime}
            onToggle={voiceRecording.handleVoiceToggle}
            onClearError={voiceRecording.clearError}
            formatTime={voiceRecording.formatTime}
          />

          {/* BOTÓN DE ENVIAR */}
          <button
            onClick={onSend}
            type="button"
            disabled={(!value.trim() && !selectedFile) || disabled}
            aria-label="Enviar mensaje"
            className="p-2 rounded-lg transition-all duration-200 
                       bg-gray-100 dark:bg-gray-700 
                       hover:bg-gray-200 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-200 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       shadow-sm hover:shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Error de archivo */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 justify-center text-xs"
          >
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
              <span className="font-medium">{fileError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}