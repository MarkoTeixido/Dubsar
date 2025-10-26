"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import Image from "next/image";

type AvatarPickerProps = {
  currentAvatar: string;
  userName: string;
  onAvatarChange: (avatar: string) => void;
};

// 9 avatares estilo Notionists Neutral (flat, minimalista, con fondo de color)
const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Felix",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Emery",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Brooklynn",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Eliza",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Leo",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Liliana",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Avery",
  "https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Brian",
];

export function AvatarPicker({ currentAvatar, userName, onAvatarChange }: AvatarPickerProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onAvatarChange(customUrl.trim());
      setCustomUrl("");
      setShowCustomInput(false);
    }
  };

  const displayAvatar = currentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  return (
    <div className="space-y-4">
      {/* Avatar actual */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
            <Image
              src={displayAvatar}
              alt="Avatar actual"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="absolute bottom-0 right-0 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
            title="Usar URL personalizada"
            type="button"
          >
            <Camera size={16} />
          </button>
        </div>
      </div>

      {/* Input para URL personalizada */}
      {showCustomInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://ejemplo.com/mi-avatar.jpg"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCustomUrlSubmit}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            type="button"
          >
            Usar esta imagen
          </button>
        </motion.div>
      )}

      {/* Galería de avatares predefinidos */}
      <div className="grid grid-cols-3 gap-3">
        {AVATAR_OPTIONS.map((avatar, index) => (
          <motion.button
            key={avatar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAvatarChange(avatar)}
            className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all ${
              currentAvatar === avatar
                ? "border-blue-500 shadow-lg"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
            }`}
            type="button"
          >
            <Image
              src={avatar}
              alt={`Avatar ${index + 1}`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Elige un avatar o pega la URL de tu imagen favorita
      </p>
    </div>
  );
}