"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type LogoProps = {
  size: number;
};

export function Logo({ size }: LogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Logo para dark mode (blanco) */}
      <Image
        src="/dubsar-icon.png"
        alt="Dubsar AI"
        width={size}
        height={size}
        className={`object-contain absolute inset-0 transition-opacity duration-500 ${
          isDarkMode ? "opacity-100" : "opacity-0"
        }`}
        priority
      />
      {/* Logo para light mode (azul oscuro) */}
      <Image
        src="/dubsar-dark-icon.png"
        alt="Dubsar AI"
        width={size}
        height={size}
        className={`object-contain absolute inset-0 transition-opacity duration-500 ${
          isDarkMode ? "opacity-0" : "opacity-100"
        }`}
        priority
      />
    </div>
  );
}