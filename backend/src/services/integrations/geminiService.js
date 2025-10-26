import { geminiClient, GEMINI_MODEL, GEMINI_CONFIG } from "../../config/gemini.js";

/**
 * Servicio para interactuar con Gemini AI
 */
export const geminiService = {
  // Generar respuesta sin streaming (legacy)
  async generateResponse(message, history = []) {
    try {
      const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });

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

  // Generar respuesta con streaming
  async generateStreamResponse(message, history = []) {
    try {
      const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });

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
   * ⚡ NUEVO: Generar respuesta sin streaming usando partes (texto + imagen)
   */
  async generateResponseWithParts(parts, history = []) {
    try {
      const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });

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
   * ⚡ NUEVO: Generar respuesta con streaming usando partes (texto + imagen)
   */
  async generateStreamResponseWithParts(parts, history = []) {
    try {
      const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });

      const chat = model.startChat({
        history,
        generationConfig: GEMINI_CONFIG,
      });

      // Enviar partes (puede incluir texto e imagen)
      const result = await chat.sendMessageStream(parts);
      return result.stream;
    } catch (error) {
      console.error("❌ Error en Gemini (streaming con partes):", error);
      throw error;
    }
  },
};