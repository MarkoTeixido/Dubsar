import { useRef } from "react";
import type { Message } from "@/types/chat";
import type { FileData } from "@/types/file";
import { chat } from "@/lib/api/chat";
import { storage } from "@/lib/storage";

interface StreamingParams {
  conversationId: string;
  userMessage: Message;
  isAuthenticated: boolean;
  fileData: FileData | null;
  onStart: () => void;
  onChunk: (text: string) => void;
  onComplete: (text: string) => void;
  onError: (errorMessage: string) => void;
}

export function useChatStreaming() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = async ({
    conversationId,
    userMessage,
    isAuthenticated,
    fileData,
    onStart,
    onChunk,
    onComplete,
    onError,
  }: StreamingParams) => {
    try {
      // Guardar mensaje del usuario en localStorage si es anónimo
      if (!isAuthenticated) {
        const conv = storage.getAnonymousConversation(conversationId);
        if (conv) {
          conv.messages.push({
            sender: "user",
            text: userMessage.text,
            timestamp: new Date().toISOString(),
            ...(fileData && {
              fileUrl: fileData.url,
              fileName: fileData.name,
              fileType: fileData.type,
              fileSize: fileData.size,
            }),
          });
          storage.saveAnonymousConversation(conv);
        }
      }

      abortControllerRef.current = new AbortController();

      // Enviar mensaje con datos del archivo
      const response = await chat.sendMessage(
        conversationId,
        userMessage.text,
        fileData
      );

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No se recibió stream del servidor");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";
      let isFirstChunk = true;

      onStart();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.chunk) {
                fullText += data.chunk;

                if (isFirstChunk) {
                  onChunk(fullText);
                  isFirstChunk = false;
                } else {
                  onChunk(fullText);
                }
              }

              if (data.done) {
                onComplete(fullText);

                // Guardar respuesta del bot en localStorage si es anónimo
                if (!isAuthenticated) {
                  const conv = storage.getAnonymousConversation(conversationId);
                  if (conv) {
                    conv.messages.push({
                      sender: "bot",
                      text: fullText,
                      timestamp: new Date().toISOString(),
                    });
                    conv.updated_at = new Date().toISOString();
                    storage.saveAnonymousConversation(conv);
                  }
                }
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error en streaming:", error);

      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      let errorMessage = "❌ **Error al conectarse con el servidor.**\n\n";

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage +=
            "Verifica que el backend esté en `http://localhost:8000`";
        } else {
          errorMessage += `**Detalles:** ${error.message}`;
        }
      }

      onError(errorMessage);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const abortStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return {
    startStreaming,
    abortStreaming,
  };
}