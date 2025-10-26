import { useState, useEffect, useCallback } from "react";
import type { Message, ChatHookReturn } from "@/types/chat";
import type { FileData } from "@/types/file";
import { conversations } from "@/lib/api/conversations";
import { files } from "@/lib/api/files";
import { storage } from "@/lib/storage";
import { useChatFileAttachment } from "./useChatFileAttachment";
import { useChatStreaming } from "./useChatStreaming";

export function useChat(
  conversationId: string | null,
  isAuthenticated: boolean,
  userName?: string,
  onMessageSent?: () => boolean
): ChatHookReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Hook de archivos
  const {
    selectedFile,
    fileError,
    handleFileSelect,
    handleRemoveFile,
    setFileError,
  } = useChatFileAttachment();

  // Hook de streaming
  const { startStreaming } = useChatStreaming();

  // ⚡ Función para mostrar mensaje de bienvenida con streaming (con cleanup)
  const showWelcomeMessage = useCallback(() => {
    const firstName = userName?.split(" ")[0] || "";
    const greeting = firstName
      ? `¡Hola ${firstName}! 😊 ¿Cómo puedo ayudarte hoy?`
      : "¡Hola! 😊 ¿Cómo puedo ayudarte hoy?";

    let currentText = "";
    const chars = greeting.split("");
    const timeouts: NodeJS.Timeout[] = [];

    setMessages([{ sender: "bot", text: "" }]);

    chars.forEach((char, index) => {
      const timeoutId = setTimeout(() => {
        currentText += char;
        setMessages([
          {
            sender: "bot",
            text: currentText,
            isStreaming: false,
          },
        ]);
      }, index * 10); // ⚡ CAMBIO AQUÍ: de 50 a 10
      
      timeouts.push(timeoutId);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [userName]);

  // ⚡ loadMessages como useCallback para evitar warning
  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      if (isAuthenticated) {
        if (conversationId.startsWith("anon_")) {
          return;
        }

        // Cargar mensajes CON archivos
        const data = await conversations.getMessages(conversationId);

        if (data.length === 0) {
          showWelcomeMessage();
        } else {
          setMessages(
            data.map(
              (msg: {
                sender: string;
                text: string;
                file_url?: string;
                file_name?: string;
                file_type?: string;
                file_size?: number;
              }) => ({
                sender: msg.sender as "user" | "bot",
                text: msg.text,
                fileUrl: msg.file_url,
                fileName: msg.file_name,
                fileType: msg.file_type,
                fileSize: msg.file_size,
              })
            )
          );
        }
      } else {
        // Cargar desde localStorage
        const conv = storage.getAnonymousConversation(conversationId);

        if (!conv || conv.messages.length === 0) {
          showWelcomeMessage();
        } else {
          setMessages(
            conv.messages.map((msg) => ({
              sender: msg.sender,
              text: msg.text,
              fileUrl: msg.fileUrl,
              fileName: msg.fileName,
              fileType: msg.fileType,
              fileSize: msg.fileSize,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      showWelcomeMessage();
    }
  }, [conversationId, isAuthenticated, showWelcomeMessage]);

  // ⚡ Cargar mensajes con cleanup
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const loadData = async () => {
      if (!conversationId) {
        cleanup = showWelcomeMessage();
        return;
      }

      // Detectar y limpiar IDs anónimos después de login
      if (conversationId.startsWith("anon_") && isAuthenticated) {
        console.log("⚠️ ID anónimo detectado después de login, limpiando...");
        cleanup = showWelcomeMessage();
        return;
      }

      await loadMessages();
    };

    loadData();

    // ⚡ Cleanup al desmontar
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [conversationId, isAuthenticated, showWelcomeMessage, loadMessages]);

  // Enviar mensaje con soporte para archivos
  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || loading || !conversationId) return;

    // Verificar límite de mensajes si es anónimo
    if (!isAuthenticated && onMessageSent) {
      const canContinue = onMessageSent();
      if (!canContinue) {
        return;
      }
    }

    setLoading(true);
    setFileError(null);

    let fileData: FileData | null = null;

    try {
      // PASO 1: Subir archivo si existe
      if (selectedFile) {
        try {
          if (isAuthenticated) {
            // Usuarios autenticados: Subir a Supabase
            const uploadResponse = await files.uploadFile(
              selectedFile,
              conversationId
            );
            fileData = uploadResponse.file;
          } else {
            // Usuarios anónimos: Guardar en localStorage como Base64
            const anonymousFile = await storage.uploadAnonymousFile(
              selectedFile,
              conversationId
            );

            // Convertir a formato FileData
            fileData = {
              url: anonymousFile.base64,
              name: anonymousFile.name,
              type: anonymousFile.type,
              size: anonymousFile.size,
              category: anonymousFile.type.startsWith("image/")
                ? "image"
                : "document",
            };
          }
        } catch (error: unknown) {
          const errorMsg =
            error instanceof Error ? error.message : "Error al subir archivo";
          setFileError(errorMsg);
          setLoading(false);
          return;
        }
      }

      // PASO 2: Crear mensaje del usuario (con o sin archivo)
      const userMessage: Message = {
        sender: "user",
        text: input.trim(),
        ...(fileData && {
          fileUrl: fileData.url,
          fileName: fileData.name,
          fileType: fileData.type,
          fileSize: fileData.size,
        }),
      };

      // Agregar mensaje del usuario INMEDIATAMENTE
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      handleRemoveFile();

      // PASO 3: Iniciar streaming
      await startStreaming({
        conversationId,
        userMessage,
        isAuthenticated,
        fileData,
        onStart: () => {
          setLoading(false);
          // Agregar mensaje del bot vacío con streaming
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "", isStreaming: true },
          ]);
        },
        onChunk: (text: string) => {
          // Actualizar SOLO el último mensaje (el del bot)
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text, isStreaming: true },
          ]);
        },
        onComplete: (text: string) => {
          // Finalizar streaming
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { sender: "bot", text, isStreaming: false },
          ]);
        },
        onError: (errorMessage: string) => {
          // Agregar mensaje de error
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: errorMessage },
          ]);
        },
      });
    } catch (error) {
      console.error("Error en sendMessage:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return {
    messages,
    input,
    loading,
    setInput,
    sendMessage,
    copyToClipboard,
    copiedIndex,
    selectedFile,
    fileError,
    handleFileSelect,
    handleRemoveFile,
  };
}