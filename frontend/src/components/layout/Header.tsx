"use client";

import { motion } from "framer-motion";
import { DarkModeToggle } from "@/components/ui/darkModeToggle";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { ShareChatButton } from "@/components/chat/ShareChatButton";
import { SidebarTrigger } from "@/components/ui/sidebar";

type AppHeaderProps = {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isAuthenticated: boolean;
  currentConversationId: string | null;
  conversationTitle?: string;
  onLoginClick: () => void;
  onRegisterClick: () => void;
};

export function AppHeader({
  darkMode,
  onToggleDarkMode,
  isAuthenticated,
  currentConversationId,
  conversationTitle,
  onLoginClick,
  onRegisterClick,
}: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Left: Sidebar Trigger */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <SidebarTrigger className="p-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors" />
      </div>

      {/* Center: Logo DUBSAR AI */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center min-w-0"
      >
        <h1 className="text-xl md:text-2xl lg:text-3xl font-light tracking-[0.1em] text-gray-800 dark:text-white font-quicksand flex items-end justify-center gap-0.5">
          <span>DUBSAR</span>
          <span className="text-base md:text-lg lg:text-xl text-blue-600 dark:text-blue-700 font-extralight tracking-tight translate-y-0.5">
            AI
          </span>
        </h1>
      </motion.div>
      
      {/* Right: Controls */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        
        {isAuthenticated ? (
          currentConversationId && (
            <ShareChatButton
              conversationId={currentConversationId}
              conversationTitle={conversationTitle}
            />
          )
        ) : (
          <div className="hidden md:flex">
            <AuthButtons
              onLoginClick={onLoginClick}
              onRegisterClick={onRegisterClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}