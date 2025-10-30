import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 8000;

// iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Dubsar AI Backend v2.0 iniciado`);
  console.log(`📍 Servidor: http://localhost:${PORT}`);
  console.log(`\n📊 Endpoints de Monitoring:`);
  console.log(`   GET    /health - Health check completo`);
  console.log(`   GET    /metrics - Métricas del sistema`);
  console.log(`   GET    /ready - Readiness probe`);
  console.log(`   GET    /live - Liveness probe`);
  console.log(`\n📋 Endpoints principales:`);
  console.log(`   GET    / - Info del servidor`);
  console.log(`\n🔐 Autenticación:`);
  console.log(`   POST   /auth/register - Registro`);
  console.log(`   POST   /auth/login - Iniciar sesión`);
  console.log(`   POST   /auth/logout - Cerrar sesión`);
  console.log(`   POST   /auth/refresh - Refrescar token`);
  console.log(`   POST   /auth/forgot-password - Recuperar contraseña`);
  console.log(`   POST   /auth/reset-password - Resetear contraseña`);
  console.log(`   PATCH  /auth/profile - Actualizar perfil`);
  console.log(`   GET    /auth/me - Perfil del usuario`);
  console.log(`   DELETE /auth/account - Eliminar cuenta`);
  console.log(`   GET    /auth/oauth/google - OAuth con Google`);
  console.log(`\n💬 Chat (público con límites anónimos):`);
  console.log(`   POST   /chat/stream - Chat con streaming`);
  console.log(`   POST   /chat - Chat sin streaming`);
  console.log(`\n📝 Conversaciones (requiere auth):`);
  console.log(`   POST   /conversations - Crear conversación`);
  console.log(`   GET    /conversations - Listar conversaciones`);
  console.log(`   GET    /conversations/:id/messages - Obtener mensajes`);
  console.log(`   PUT    /conversations/:id - Actualizar título`);
  console.log(`   DELETE /conversations/:id - Eliminar conversación`);
  console.log(`\n📎 Archivos:`);
  console.log(`   POST   /files/upload - Subir archivo`);
  console.log(`   GET    /files/status - Estado de límites`);
  console.log(`\n✅ Backend listo para recibir peticiones\n`);
});