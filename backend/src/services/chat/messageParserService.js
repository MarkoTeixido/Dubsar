/**
 * Servicio de Parseo de Mensajes
 * Maneja la preparación de mensajes con texto e imágenes
 */
export const messageParserService = {
  /**
   * Prepara las partes del mensaje para enviar a Gemini (texto + imagen)
   */
  prepareMessageParts(message, fileData) {
    const messageParts = [];

    // Agregar texto si existe
    if (message) {
      messageParts.push({ text: message });
    }

    // Agregar imagen si existe
    if (fileData && fileData.category === 'image') {
      const imagePart = this.parseImageData(fileData);
      if (imagePart) {
        messageParts.push(imagePart);
      }
    }

    // Si solo hay imagen sin texto, agregar pregunta por defecto
    if (!message && fileData && fileData.category === 'image') {
      messageParts.unshift({ text: "¿Qué hay en esta imagen?" });
    }

    return messageParts;
  },

  /**
   * Convierte los datos de imagen en el formato requerido por Gemini
   */
  parseImageData(fileData) {
    try {
      // Si es Base64 (usuarios anónimos)
      if (fileData.url.startsWith('data:image')) {
        const base64Data = fileData.url.split(',')[1];
        const mimeType = fileData.type || 'image/png';

        console.log(`📷 Imagen Base64 agregada al mensaje`);

        return {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        };
      } else {
        // Si es URL de Supabase (usuarios autenticados)
        console.log(`📷 Imagen URL detectada (ya está en historial)`);
        return null; // No agregar, ya está en el historial
      }
    } catch (error) {
      console.error("❌ Error procesando imagen:", error);
      return null;
    }
  },
};