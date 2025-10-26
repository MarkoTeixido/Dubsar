import { fileService } from "./fileService.js";
import { logger } from "../../utils/logger.js";

/**
 * Servicio de Subida de Archivos
 * Maneja la lógica de negocio de subida de archivos
 */
export const fileUploadService = {
  /**
   * Valida que se haya recibido un archivo
   */
  validateFilePresence(file) {
    if (!file) {
      throw new Error("VALIDATION: No se recibió ningún archivo");
    }
  },

  /**
   * Valida que se haya recibido el conversationId
   */
  validateConversationId(conversationId) {
    if (!conversationId) {
      throw new Error("VALIDATION: conversationId es requerido");
    }
  },

  /**
   * Valida el archivo completo (tipo y tamaño)
   */
  validateFile(file) {
    this.validateFilePresence(file);
    fileService.validateFileType(file.mimetype);
    fileService.validateFileSize(file.size);
  },

  /**
   * Verifica si el usuario puede subir archivos
   */
  async checkUploadPermissions(userId) {
    const uploadStatus = await fileService.canUploadFile(userId);

    if (!uploadStatus.canUpload) {
      const errorMessage = userId
        ? "Has alcanzado el límite de 4 archivos. Elimina conversaciones con archivos para subir más."
        : "Has alcanzado el límite de 2 archivos. Regístrate para subir hasta 4 archivos.";

      const error = new Error(errorMessage);
      error.code = "LIMIT_REACHED";
      error.limit = uploadStatus.limit;
      error.current = uploadStatus.current;
      throw error;
    }

    return uploadStatus;
  },

  /**
   * Procesa la subida de un archivo
   */
  async processFileUpload(file, conversationId, userId) {
    // Validar archivo
    this.validateFile(file);
    this.validateConversationId(conversationId);

    // Verificar permisos
    const uploadStatus = await this.checkUploadPermissions(userId);

    // Subir archivo
    const uploadResult = await fileService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      conversationId
    );

    logger.info(`✅ Archivo subido: ${file.originalname} (${file.size} bytes)`);

    return {
      uploadResult,
      uploadStatus,
      file,
    };
  },

  /**
   * Construye la respuesta de subida exitosa
   */
  buildUploadResponse(uploadResult, uploadStatus, file) {
    return {
      success: true,
      file: {
        url: uploadResult.url,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        category: fileService.getFileCategory(file.mimetype),
      },
      uploadStatus: {
        current: uploadStatus.current + 1,
        limit: uploadStatus.limit,
        remaining: uploadStatus.remaining - 1,
      },
    };
  },

  /**
   * Obtiene el estado de límites de archivos
   */
  async getUploadStatus(userId) {
    const status = await fileService.canUploadFile(userId);
    return {
      success: true,
      ...status,
    };
  },
};