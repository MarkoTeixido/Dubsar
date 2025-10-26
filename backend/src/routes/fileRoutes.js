import express from "express";
import multer from "multer";
import { fileService } from "../services/file/fileService.js";
import { fileUploadService } from "../services/file/fileUploadService.js";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: fileService.MAX_FILE_SIZE,
  },
});

/**
 * POST /files/upload
 * Subir archivo
 */
router.post("/upload", optionalAuth, upload.single("file"), async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user?.id; // null si es anónimo

    // Procesar subida
    const result = await fileUploadService.processFileUpload(
      req.file,
      conversationId,
      userId
    );

    // Construir respuesta
    const response = fileUploadService.buildUploadResponse(
      result.uploadResult,
      result.uploadStatus,
      result.file
    );

    res.json(response);
  } catch (error) {
    // Manejo específico de errores de validación
    if (error.message.startsWith("VALIDATION:")) {
      return res.status(400).json({
        error: "Error de validación",
        message: error.message.replace("VALIDATION: ", ""),
      });
    }

    // Manejo específico de errores de límite
    if (error.code === "LIMIT_REACHED") {
      return res.status(403).json({
        error: "Límite de archivos alcanzado",
        message: error.message,
        limit: error.limit,
        current: error.current,
      });
    }

    // Otros errores
    logger.error("❌ Error al subir archivo:", error);
    next(error);
  }
});

/**
 * GET /files/status
 * Obtener estado de límites de archivos del usuario
 */
router.get("/status", optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const status = await fileUploadService.getUploadStatus(userId);

    res.json(status);
  } catch (error) {
    next(error);
  }
});

export default router;