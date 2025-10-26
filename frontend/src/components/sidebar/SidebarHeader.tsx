"use client";

import { motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./SidebarLogo";
import { useSidebar } from "@/components/ui/sidebar";
import type { RefObject } from "react";

type ConversationHeaderProps = {
  onCreateConversation: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  searchInputRef: RefObject<HTMLInputElement>;
  onClearSearch: () => void;
};

export function ConversationHeader({
  onCreateConversation,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  searchInputRef,
  onClearSearch,
}: ConversationHeaderProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 space-y-3">
      {/* Header con Logo y botón X (solo mobile) */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <Logo size={25} />
          
          {/* Botón X para cerrar */}
          <button
            onClick={() => setOpenMobile(false)}
            className="py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Logo centrado (solo desktop) */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center mb-4"
        >
          <Logo size={25} />
        </motion.div>
      )}

      {/* Botón Nueva conversación */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button
          onClick={onCreateConversation}
          className="w-full justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-colors rounded-lg h-10"
          size="default"
        >
          <Plus size={18} />
          <span className="font-medium">Nueva conversación</span>
        </Button>
      </motion.div>

      {/* Barra de búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="relative"
      >
        <div className="relative flex items-center gap-2 w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400 dark:focus-within:ring-blue-500 focus-within:border-transparent">
          <Search className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={16} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isSearchFocused ? "" : "Buscar conversaciones"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none border-none"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}