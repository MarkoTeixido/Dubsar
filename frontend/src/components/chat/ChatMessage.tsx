import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import type { Message } from "@/types/chat";

type ChatMessageProps = {
  message: Message;
  index: number;
  onCopy: (text: string, index: number) => void;
  isCopied: boolean;
};

export function ChatMessage({ message, index, onCopy, isCopied }: ChatMessageProps) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[80%] px-4 py-3 rounded-2xl text-sm md:text-base whitespace-pre-wrap shadow-md group
        ${
          isUser
            ? "bg-blue-500 dark:bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
        }`}
      >
        {/* Botón copiar para mensajes del bot */}
        {!isUser && (
          <button
            onClick={() => onCopy(message.text, index)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Copiar mensaje"
          >
            {isCopied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
        )}
        
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className="whitespace-pre-wrap">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mt-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mt-2">
                {children}
              </ol>
            ),
            code: ({ children }) => (
              <code className="bg-gray-200 dark:bg-gray-800 rounded px-1.5 py-0.5 text-xs font-mono">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-200 dark:bg-gray-900 rounded-lg p-3 overflow-x-auto mt-2">
                {children}
              </pre>
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}