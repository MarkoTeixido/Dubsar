import express from "express";
import { conversationController } from "../controllers/conversationController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateUser);

router.post("/", conversationController.create);
router.get("/", conversationController.getAll);
router.get("/:id/messages", conversationController.getMessages);
router.put("/:id", conversationController.updateTitle);
router.delete("/:id", conversationController.delete);

export default router;