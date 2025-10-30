// backend/src/app.js
import express from "express";
import cors from "cors";

// Importar configuraciones
import "./config/database.js";
import "./config/gemini.js";

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// Importar middlewares
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import { trackMetrics } from "./middleware/metrics.js"; 

const app = express();

// ========================================
// MIDDLEWARES GLOBALES
// ========================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Monitoring middlewares
app.use(trackMetrics);
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// ========================================
// RUTAS
// ========================================

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "✅ Dubsar AI Backend running",
    version: "2.0.0",
    features: ["Auth", "Chat", "Streaming", "OAuth", "Anonymous Chat"],
    timestamp: new Date().toISOString(),
  });
});

// Health & Metrics
app.use("/", healthRoutes); //  - /health, /metrics, /ready, /live

// Feature routes
app.use("/auth", authRoutes);
app.use("/conversations", conversationRoutes);
app.use("/chat", chatRoutes);
app.use("/files", fileRoutes);

// ========================================
// MANEJO DE ERRORES
// ========================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;