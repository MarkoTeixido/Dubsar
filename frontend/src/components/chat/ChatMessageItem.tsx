"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageFile } from "./MessageFile";
import { CopyButton } from "./CopyButton";
import type { Message } from "@/types/chat";
import type { Components } from "react-markdown";

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

  // ✅ Definir componentes de ReactMarkdown con tipos correctos
  const markdownComponents: Components = {
    // Links clicables con color
    a: ({ children, href }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-600 transition-colors duration-200 font-medium"
      >
        {children}
      </a>
    ),
    
    // Código inline y bloques
    code: ({ children, className }) => {
      // Detectar si es código inline o bloque por className
      const isInline = !className;
      
      if (isInline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      
      return (
        <code className={className}>
          {children}
        </code>
      );
    },
    
    // Bloques de código pre
    pre: ({ children }) => (
      <pre className="bg-gray-900 dark:bg-black text-gray-100 rounded-lg p-4 overflow-x-auto my-3 border border-gray-700">
        {children}
      </pre>
    ),
    
    // Listas desordenadas
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-4 space-y-1 my-2">
        {children}
      </ul>
    ),
    
    // Listas ordenadas
    ol: ({ children }) => (
      <ol className="list-decimal list-outside ml-4 space-y-1 my-2">
        {children}
      </ol>
    ),
    
    // Negritas
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    
    // Cursivas
    em: ({ children }) => (
      <em className="italic text-gray-700 dark:text-gray-300">
        {children}
      </em>
    ),
    
    // Párrafos
    p: ({ children }) => (
      <p className="mb-2 last:mb-0 leading-relaxed">
        {children}
      </p>
    ),
    
    // Títulos
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-3 mb-1 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    
    // Citas (blockquotes)
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300 my-2">
        {children}
      </blockquote>
    ),
    
    // Líneas horizontales
    hr: () => (
      <hr className="border-gray-300 dark:border-gray-700 my-4" />
    ),
  };

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
            <p className="text-sm md:text-base whitespace-pre-wrap break-words">
              {message.text}
            </p>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none break-words">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.text}
              </ReactMarkdown>
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