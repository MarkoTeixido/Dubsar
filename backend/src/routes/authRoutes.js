import express from "express";
import { authController } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { validateRequiredFields, validateEmail, validatePassword } from "../middlewares/validateRequest.js";

const router = express.Router();

// Rutas públicas
router.post(
  "/register",
  validateRequiredFields(["email", "password"]),
  validateEmail,
  validatePassword(6),
  authController.register
);

router.post(
  "/login",
  validateRequiredFields(["email", "password"]),
  validateEmail,
  authController.login
);

router.post("/logout", authController.logout);

router.post(
  "/refresh",
  validateRequiredFields(["refresh_token"]),
  authController.refreshToken
);

router.get("/oauth/google", authController.oauthGoogle);

// Rutas protegidas
router.get("/me", authenticateUser, authController.getProfile);
router.patch("/profile", authenticateUser, authController.updateProfile);

// ⚡ NUEVO: Eliminar cuenta
router.delete("/account", authenticateUser, authController.deleteAccount);

export default router;