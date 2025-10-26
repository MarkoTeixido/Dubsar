"use client";

import { AnimatePresence } from "framer-motion";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatLoadingIndicator } from "./ChatLoadingIndicator";
import type { Message } from "@/types/chat";

type ChatMessageListProps = {
  messages: Message[];
  loading: boolean;
  onCopy: (text: string, index: number) => void;
  copiedIndex: number | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export function ChatMessageList({
  messages,
  loading,
  onCopy,
  copiedIndex,
  messagesEndRef,
}: ChatMessageListProps) {
  const showLoadingIndicator = loading && messages[messages.length - 1]?.sender === "user";

  return (
    <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
      <AnimatePresence>
        {messages.map((message, index) => (
          <ChatMessageItem
            key={index}
            message={message}
            index={index}
            onCopy={onCopy}
            copiedIndex={copiedIndex}
          />
        ))}
      </AnimatePresence>

      {/* Loading indicator */}
      {showLoadingIndicator && <ChatLoadingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}