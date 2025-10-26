import { useState, useEffect } from "react";

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar preferencia de dark mode
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved) {
      setDarkMode(JSON.parse(saved));
    } else {
      setDarkMode(prefersDark);
    }
  }, []);

  // Aplicar dark mode
  useEffect(() => {
    if (!mounted) return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return {
    darkMode,
    mounted,
    toggleDarkMode,
  };
}