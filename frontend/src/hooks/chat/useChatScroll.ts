import { useRef, useEffect } from "react";
import type { RefObject } from "react";
import type { Message } from "@/types/chat";

export function useChatScroll(messages: Message[]) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return { 
    messagesEndRef: messagesEndRef as RefObject<HTMLDivElement> 
  };
}