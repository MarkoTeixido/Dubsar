"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import type { RefObject } from "react";
import type { Conversation } from "@/hooks/conversations/useConversations";

type ConversationItemProps = {
  conversation: Conversation;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
};

export function ConversationItem({
  conversation,
  isActive,
  isEditing,
  editTitle,
  setEditTitle,
  inputRef,
  menuOpenId,
  setMenuOpenId,
  onSelect,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
}: ConversationItemProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (menuOpenId !== conversation.id) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };

    // Agregar listener después de un pequeño delay para evitar cerrar inmediatamente
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId, conversation.id, setMenuOpenId]);

  if (isEditing) {
    return (
      <div className="relative flex items-center px-3 py-2.5 bg-gray-200/80 dark:bg-gray-700/80 rounded-lg">
        <div className="absolute left-1 top-1 bottom-1 w-1 bg-blue-500 rounded-full" />
        
        <input
          ref={inputRef}
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSaveEdit(conversation.id);
            } else if (e.key === "Escape") {
              onCancelEdit();
            }
          }}
          onBlur={() => onSaveEdit(conversation.id)}
          className="flex-1 ml-3 px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 w-full"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="relative w-full group/conversation">
      <div
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
          isActive
            ? "bg-gray-200/80 dark:bg-gray-700/80"
            : "hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        }`}
        onClick={() => onSelect(conversation.id)}
      >
        {isActive && (
          <div className="absolute left-1 top-1 bottom-1 w-1 bg-blue-500 rounded-full" />
        )}

        <div className={`flex-1 min-w-0 overflow-hidden ${isActive ? 'pl-3' : 'pl-0'}`}>
          <span className="block truncate font-medium text-sm text-gray-900 dark:text-gray-100">
            {conversation.title}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpenId(menuOpenId === conversation.id ? null : conversation.id);
          }}
          className={`p-1.5 rounded-md transition-all duration-200 flex-shrink-0 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 ${
            isActive 
              ? 'opacity-100' 
              : 'opacity-0 group-hover/conversation:opacity-100'
          }`}
          aria-label="Opciones"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpenId === conversation.id && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden min-w-[140px]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(conversation);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit2 size={14} />
              <span>Renombrar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} />
              <span>Eliminar</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}