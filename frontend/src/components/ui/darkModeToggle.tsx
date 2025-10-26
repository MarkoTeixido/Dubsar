"use client";

import { Sun, Moon } from "lucide-react";

type DarkModeToggleProps = {
  darkMode: boolean;
  onToggle: () => void;
};

export function DarkModeToggle({ darkMode, onToggle }: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={darkMode ? "Modo claro" : "Modo oscuro"}
    >
      {darkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-700" />
      )}
    </button>
  );
}