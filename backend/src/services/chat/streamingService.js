import { geminiService } from "../integrations/geminiService.js";
import { chatService } from "./chatService.js";

/**
 * Servicio de Streaming
 * Maneja la lógica de Server-Sent Events (SSE)
 */
export const streamingService = {
  /**
   * Configura los headers necesarios para SSE
   */
  setupSSE(res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
  },

  /**
   * Envía un chunk al cliente
   */
  sendChunk(res, data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  },

  /**
   * Procesa el stream de Gemini y lo envía al cliente
   */
  async processStream(res, conversationId, messageParts, geminiHistory, userId) {
    console.log(`📡 [${conversationId}] Streaming iniciado ${userId ? `por usuario ${userId}` : 'anónimamente'}`);

    try {
      const stream = await geminiService.generateStreamResponseWithParts(
        messageParts,
        geminiHistory
      );

      let fullResponse = "";
      let chunkCount = 0;

      // Streamear chunks al cliente
      for await (const chunk of stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        chunkCount++;

        this.sendChunk(res, { chunk: chunkText });
      }

      console.log(`✅ [${conversationId}] Enviados ${chunkCount} chunks`);

      // Guardar respuesta completa
      await chatService.saveBotResponse(userId, conversationId, fullResponse);

      // Señal de finalización
      this.sendChunk(res, { done: true });
      res.end();

      console.log(`🏁 [${conversationId}] Streaming completado`);

      return fullResponse;
    } catch (error) {
      console.error("❌ Error en streaming:", error);
      this.sendChunk(res, { error: error.message });
      res.end();
      throw error;
    }
  },
};