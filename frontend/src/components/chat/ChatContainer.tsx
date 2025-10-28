"use client";

import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { useChatScroll } from "@/hooks/chat/useChatScroll";
import type { Message } from "@/types/chat";

type ChatContainerProps = {
  messages: Message[];
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onCopy: (text: string, index: number) => void;
  copiedIndex: number | null;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  onRemoveFile?: () => void;
  fileError?: string | null;
};

export function ChatContainer({
  messages,
  input,
  loading,
  onInputChange,
  onSend,
  onCopy,
  copiedIndex,
  onFileSelect,
  selectedFile,
  onRemoveFile,
  fileError,
}: ChatContainerProps) {
  const { messagesEndRef } = useChatScroll(messages);

  return (
    <div className="flex flex-col w-full max-w-4xl h-full px-2 md:px-0">
      {/* Messages Area */}
      <ChatMessageList
        messages={messages}
        loading={loading}
        onCopy={onCopy}
        copiedIndex={copiedIndex}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={loading}
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
        onRemoveFile={onRemoveFile}
        fileError={fileError || undefined}
      />
    </div>
  );
}