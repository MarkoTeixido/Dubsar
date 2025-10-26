"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageFile } from "./MessageFile";
import { CopyButton } from "./CopyButton";
import type { Message } from "@/types/chat";

type ChatMessageItemProps = {
  message: Message;
  index: number;
  onCopy: (text: string, index: number) => void;
  copiedIndex: number | null;
};

export function ChatMessageItem({
  message,
  index,
  onCopy,
  copiedIndex,
}: ChatMessageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.sender === "user";
  const isCopied = copiedIndex === index;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative max-w-[85%] md:max-w-[80%] px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-md ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
        }`}
      >
        {/* ARCHIVO ADJUNTO */}
        {message.fileUrl && message.fileName && message.fileType && (
          <MessageFile
            fileUrl={message.fileUrl}
            fileName={message.fileName}
            fileType={message.fileType}
            fileSize={message.fileSize}
          />
        )}

        {/* TEXTO DEL MENSAJE */}
        {message.text && (
          isUser ? (
            <p className="text-sm md:text-base whitespace-pre-wrap break-words">{message.text}</p>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
            </div>
          )
        )}

        {/* BOTÓN DE COPIAR (solo para bot) */}
        {!isUser && !message.isStreaming && isHovered && (
          <CopyButton
            text={message.text}
            index={index}
            isCopied={isCopied}
            onCopy={onCopy}
          />
        )}

        {/* INDICADOR DE STREAMING */}
        {message.isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="inline-block ml-1"
          >
            ▊
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}