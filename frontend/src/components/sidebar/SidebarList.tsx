"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { ConversationItem } from "./SidebarItem";
import type { RefObject } from "react";
import type { Conversation } from "@/hooks/conversations/useConversations";

type ConversationListProps = {
  groupedConversations: [string, Conversation[]][];
  filteredCount: number;
  searchQuery: string;
  currentConversationId: string | null;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  inputRef: RefObject<HTMLInputElement>; 
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onSelectConversation: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onStartEdit: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  onClearSearch: () => void;
};

export function ConversationList({
  groupedConversations,
  filteredCount,
  searchQuery,
  currentConversationId,
  editingId,
  editTitle,
  setEditTitle,
  inputRef,
  menuOpenId,
  setMenuOpenId,
  onSelectConversation,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onDelete,
  onClearSearch,
}: ConversationListProps) {
  if (filteredCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare
          size={48}
          className="text-gray-300 dark:text-gray-600 mb-3 opacity-50"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {searchQuery ? "No se encontraron conversaciones" : "No hay conversaciones aún"}
        </p>
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="mt-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {groupedConversations.map(([groupName, groupConvs]) => (
        <div key={groupName}>
          {/* Encabezado del grupo */}
          <div className="px-2 py-1 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {groupName}
            </h3>
          </div>

          {/* Conversaciones del grupo */}
          <SidebarMenu className="gap-1">
            <AnimatePresence>
              {groupConvs.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="relative"
                >
                  <SidebarMenuItem>
                    <ConversationItem
                      conversation={conv}
                      isActive={currentConversationId === conv.id}
                      isEditing={editingId === conv.id}
                      editTitle={editTitle}
                      setEditTitle={setEditTitle}
                      inputRef={inputRef}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      onSelect={onSelectConversation}
                      onSaveEdit={onSaveEdit}
                      onCancelEdit={onCancelEdit}
                      onStartEdit={onStartEdit}
                      onDelete={onDelete}
                    />
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </SidebarMenu>
        </div>
      ))}
    </div>
  );
}