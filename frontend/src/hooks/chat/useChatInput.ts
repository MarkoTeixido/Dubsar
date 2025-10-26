import { useEffect, useRef } from "react";

export function useChatInput(value: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + "px";
    }
  }, [value]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    onSend: () => void,
    disabled: boolean
  ) => {
    if (e.key === "Enter" && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSend();
    }
  };

  return {
    textareaRef,
    handleKeyDown,
  };
}