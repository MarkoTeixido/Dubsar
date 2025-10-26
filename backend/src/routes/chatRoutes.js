import express from "express";
import { chatController } from "../controllers/chatController.js";
import { optionalAuth } from "../middlewares/authMiddleware.js"; 
import { validateRequiredFields } from "../middlewares/validateRequest.js"; 

const router = express.Router();

// Usar optionalAuth en lugar de authenticateUser
// Esto permite que funcione con o sin autenticación
router.post(
  "/stream",
  optionalAuth,
  validateRequiredFields(["message", "conversationId"]),
  chatController.streamChat
);

router.post(
  "/",
  optionalAuth,
  validateRequiredFields(["message", "conversationId"]),
  chatController.chat
);

export default router;