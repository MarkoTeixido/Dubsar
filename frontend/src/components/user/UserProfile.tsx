"use client";

import { motion } from "framer-motion";
import type { User } from "@/types/user";
import Image from "next/image";

type UserProfileProps = {
  user: User;
  conversationCount: number;
  onLogout: () => void;
  onOpenProfile: () => void;
  isCollapsed: boolean;
};

export function UserProfile({
  user,
  conversationCount,
  onOpenProfile,
  isCollapsed,
}: UserProfileProps) {
  const avatarUrl = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName || user.email)}`;
  const userName = user.fullName || "Usuario";
  const userInitial = (user.fullName?.[0] || user.email[0]).toUpperCase();

  // Vista colapsada
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Contador colapsado */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {conversationCount}
          </span>
        </div>

        {/* Separador */}
        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>

        {/* Avatar clickeable */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
          title={userName}
          type="button"
        >
          {user.avatar ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </motion.button>
      </div>
    );
  }

  // Vista expandida
  return (
    <div className="space-y-3">
      {/* Contador de conversaciones */}
      <div className="flex items-center justify-center py-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {conversationCount} {conversationCount === 1 ? "conversación" : "conversaciones"}
        </span>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 dark:border-gray-700"></div>

      {/* Usuario clickeable */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenProfile}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md group"
        type="button"
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md group-hover:shadow-lg transition-shadow">
          {user.avatar ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover"
              unoptimized
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </div>

        {/* Info del usuario */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {userName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user.email}
          </p>
        </div>
      </motion.button>
    </div>
  );
}