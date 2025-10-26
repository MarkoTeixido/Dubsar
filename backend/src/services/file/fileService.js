import { supabase, supabaseAdmin } from "../../config/database.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Servicio para manejar archivos en Supabase Storage
 */
export const fileService = {
  // Tipos de archivo permitidos (según tu configuración en Supabase)
  ALLOWED_TYPES: {
    images: ["image/jpeg", "image/jpg", "image/png"],
    documents: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    text: ["text/plain", "text/csv"],
    json: ["application/json"],
  },

  // Tamaño máximo: 30MB (según tu config)
  MAX_FILE_SIZE: 30 * 1024 * 1024,

  // Límites por tipo de usuario
  LIMITS: {
    anonymous: 2,
    authenticated: 4,
  },

  /**
   * Validar tipo de archivo
   */
  validateFileType(fileType) {
    const allAllowedTypes = [
      ...this.ALLOWED_TYPES.images,
      ...this.ALLOWED_TYPES.documents,
      ...this.ALLOWED_TYPES.text,
      ...this.ALLOWED_TYPES.json,
    ];

    if (!allAllowedTypes.includes(fileType)) {
      throw new Error(`Tipo de archivo no permitido: ${fileType}`);
    }

    return true;
  },

  /**
   * Validar tamaño de archivo
   */
  validateFileSize(fileSize) {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new Error(`Archivo demasiado grande. Máximo: 30MB`);
    }
    return true;
  },

  /**
   * Contar archivos enviados por un usuario (CORREGIDO)
   */
  async countUserFiles(userId = null) {
    try {
      // Si no hay userId, es anónimo - retornar 0 (se maneja en frontend/localStorage)
      if (!userId) {
        return 0;
      }

      // ⚡ FIX: Primero obtener IDs de conversaciones del usuario
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", userId);

      if (convError) throw convError;

      // Si no tiene conversaciones, retornar 0
      if (!conversations || conversations.length === 0) {
        return 0;
      }

      // Extraer IDs
      const conversationIds = conversations.map(c => c.id);

      // Contar mensajes con archivos en esas conversaciones
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .not("file_url", "is", null)
        .in("conversation_id", conversationIds);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error("Error al contar archivos:", error);
      return 0;
    }
  },

  /**
   * Verificar si el usuario puede subir más archivos
   */
  async canUploadFile(userId = null) {
    const fileCount = await this.countUserFiles(userId);
    const limit = userId ? this.LIMITS.authenticated : this.LIMITS.anonymous;

    return {
      canUpload: fileCount < limit,
      current: fileCount,
      limit,
      remaining: limit - fileCount,
    };
  },

  /**
   * Subir archivo a Supabase Storage (CORREGIDO CON ADMIN)
   */
  async uploadFile(fileBuffer, fileName, fileType, conversationId) {
    try {
      // Generar nombre único
      const fileExt = fileName.split(".").pop();
      const uniqueName = `${conversationId}/${uuidv4()}.${fileExt}`;

      // ⚡ FIX: Usar supabaseAdmin para evitar RLS
      const { data, error } = await supabaseAdmin.storage
        .from("chat-files")
        .upload(uniqueName, fileBuffer, {
          contentType: fileType,
          upsert: false,
        });

      if (error) {
        console.error("Error de Supabase Storage:", error);
        throw error;
      }

      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from("chat-files")
        .getPublicUrl(uniqueName);

      return {
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error("Error al subir archivo:", error);
      throw new Error("Error al subir el archivo");
    }
  },

  /**
   * Eliminar archivo de Supabase Storage
   */
  async deleteFile(filePath) {
    try {
      const { error } = await supabaseAdmin.storage
        .from("chat-files")
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      return false;
    }
  },

  /**
   * Determinar si el archivo es una imagen
   */
  isImage(fileType) {
    return this.ALLOWED_TYPES.images.includes(fileType);
  },

  /**
   * Determinar categoría del archivo
   */
  getFileCategory(fileType) {
    if (this.ALLOWED_TYPES.images.includes(fileType)) return "image";
    if (this.ALLOWED_TYPES.documents.includes(fileType)) return "document";
    if (this.ALLOWED_TYPES.text.includes(fileType)) return "text";
    if (this.ALLOWED_TYPES.json.includes(fileType)) return "json";
    return "other";
  },
};