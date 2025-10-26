import { supabase } from "../../config/database.js";
import fetch from "node-fetch"; // ⚡ Necesitarás instalar: npm install node-fetch

/**
 * Servicio para operaciones de mensajes en Supabase
 */
export const messageService = {
  // Guardar mensaje del usuario (CON SOPORTE PARA ARCHIVOS)
  async saveUserMessage(conversationId, text, fileData = null) {
    const messageData = {
      conversation_id: conversationId,
      sender: "user",
      text: text || "",
    };

    if (fileData) {
      messageData.file_url = fileData.url;
      messageData.file_name = fileData.name;
      messageData.file_type = fileData.type;
      messageData.file_size = fileData.size;
    }

    const { error } = await supabase.from("messages").insert(messageData);

    if (error) throw error;
  },

  // Guardar mensaje del bot
  async saveBotMessage(conversationId, text) {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender: "bot",
      text,
    });

    if (error) throw error;
  },

  // Obtener historial de mensajes de una conversación (CON ARCHIVOS)
  async getHistory(conversationId, limit = 50) {
    const { data, error } = await supabase
      .from("messages")
      .select("sender, text, file_url, file_name, file_type, file_size, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * ⚡ NUEVA FUNCIÓN: Descargar imagen y convertir a Base64
   */
  async imageUrlToBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.buffer();
      return buffer.toString('base64');
    } catch (error) {
      console.error("Error al descargar imagen:", error);
      return null;
    }
  },

  /**
   * ⚡ ACTUALIZADO: Formatear historial para Gemini CON IMÁGENES REALES
   */
  async formatForGemini(messages) {
    const formattedMessages = [];

    for (const msg of messages) {
      const parts = [];

      // Agregar texto si existe
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      // ⚡ Si tiene imagen, descargarla y convertirla a Base64
      if (msg.file_url && msg.file_type?.startsWith("image/")) {
        try {
          // Detectar si es Base64 (para anónimos) o URL (para autenticados)
          if (msg.file_url.startsWith('data:image')) {
            // Ya es Base64 (usuario anónimo)
            const base64Data = msg.file_url.split(',')[1];
            const mimeType = msg.file_url.split(';')[0].split(':')[1];
            
            parts.push({
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            });
          } else {
            // Es URL de Supabase (usuario autenticado)
            const base64Data = await this.imageUrlToBase64(msg.file_url);
            
            if (base64Data) {
              parts.push({
                inlineData: {
                  mimeType: msg.file_type,
                  data: base64Data,
                },
              });
            } else {
              // Si falla la descarga, al menos mencionar que hay imagen
              parts.push({
                text: `[No se pudo cargar la imagen: ${msg.file_name}]`,
              });
            }
          }
        } catch (error) {
          console.error("Error procesando imagen para Gemini:", error);
          parts.push({
            text: `[Error al procesar imagen: ${msg.file_name}]`,
          });
        }
      }

      // Si tiene documento adjunto (PDF, Word, etc.)
      if (msg.file_url && !msg.file_type?.startsWith("image/")) {
        parts.push({
          text: `[El usuario adjuntó un documento: ${msg.file_name} (${msg.file_type})]`,
        });
      }

      formattedMessages.push({
        role: msg.sender === "user" ? "user" : "model",
        parts,
      });
    }

    return formattedMessages;
  },

  // Contar mensajes en una conversación
  async countMessages(conversationId) {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId);

    if (error) throw error;
    return count;
  },
};