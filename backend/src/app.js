import express from "express";
import cors from "cors";

// Importar configuraciones (esto valida las variables de entorno)
import "./config/database.js";
import "./config/gemini.js";

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

// Importar middlewares
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

// ========================================
// MIDDLEWARES GLOBALES
// ========================================
app.use(cors());
app.use(express.json());

// ========================================
// RUTAS
// ========================================

// Health check (pública)
app.get("/", (req, res) => {
  res.json({
    status: "✅ Dubsar AI Backend running",
    version: "2.0.0",
    features: ["Auth", "Chat", "Streaming", "OAuth", "Anonymous Chat"],
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: "Supabase (PostgreSQL)",
  });
});

// Rutas de autenticación (públicas)
app.use("/auth", authRoutes);

// Rutas de conversaciones (protegidas)
app.use("/conversations", conversationRoutes);

// Rutas de chat (públicas con optionalAuth)
app.use("/chat", chatRoutes);

// Rutas de archivos
app.use("/files", fileRoutes);

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use(notFoundHandler);
app.use(errorHandler);

// Exportar la app
export default app;