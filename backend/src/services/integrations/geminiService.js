import { getModelWithInstructions, GEMINI_CONFIG } from "../../config/gemini.js";

/**
 * Servicio para interactuar con Gemini AI
 * Maneja la generación de respuestas con y sin streaming
 */
export const geminiService = {
  /**
   * Genera respuesta completa sin streaming (legacy - no se usa actualmente)
   * @param {string} message - Mensaje del usuario
   * @param {Array} history - Historial de conversación formateado
   * @returns {Promise<string>} - Respuesta generada
   */
  async generateResponse(message, history = []) {
    try {
      const model = getModelWithInstructions();

      const chat = model.startChat({
        history,
        generationConfig: GEMINI_CONFIG,
      });

      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Gemini no generó una respuesta");
      }

      return responseText;
    } catch (error) {
      console.error("❌ Error en Gemini (sin streaming):", error);
      throw error;
    }
  },

  /**
   * Genera respuesta con streaming (legacy - no se usa actualmente)
   * @param {string} message - Mensaje del usuario
   * @param {Array} history - Historial de conversación formateado
   * @returns {Promise<Stream>} - Stream de chunks
   */
  async generateStreamResponse(message, history = []) {
    try {
      const model = getModelWithInstructions();

      const chat = model.startChat({
        history,
        generationConfig: GEMINI_CONFIG,
      });

      const result = await chat.sendMessageStream(message);
      return result.stream;
    } catch (error) {
      console.error("❌ Error en Gemini (streaming):", error);
      throw error;
    }
  },

  /**
   * Genera respuesta completa usando partes (texto + imagen/archivo)
   * @param {Array} parts - Array de partes del mensaje (texto, imágenes, etc.)
   * @param {Array} history - Historial de conversación formateado
   * @returns {Promise<string>} - Respuesta generada
   */
  async generateResponseWithParts(parts, history = []) {
    try {
      const model = getModelWithInstructions();

      const chat = model.startChat({
        history,
        generationConfig: GEMINI_CONFIG,
      });

      const result = await chat.sendMessage(parts);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("Gemini no generó una respuesta");
      }

      return responseText;
    } catch (error) {
      console.error("❌ Error en Gemini (sin streaming con partes):", error);
      throw error;
    }
  },

  /**
   * Genera respuesta con streaming usando partes (texto + imagen/archivo)
   * Método principal usado en la aplicación
   * @param {Array} parts - Array de partes del mensaje
   * @param {Array} history - Historial de conversación formateado
   * @returns {Promise<Stream>} - Stream de chunks para SSE
   */
  async generateStreamResponseWithParts(parts, history = []) {
    try {
      const model = getModelWithInstructions();

      const chat = model.startChat({
        history,
        generationConfig: GEMINI_CONFIG,
      });

      const result = await chat.sendMessageStream(parts);
      return result.stream;
    } catch (error) {
      console.error("❌ Error en Gemini (streaming con partes):", error);
      throw error;
    }
  },
};