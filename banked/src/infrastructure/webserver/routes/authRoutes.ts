const { Router } = require("express");
import { AuthController } from "../controllers/AuthController";

export function buildAuthRoutes(authController: AuthController) {
  const router = Router();
  router.post("/google-login", authController.loginWithGoogle);
  router.post("/refresh-token", authController.refreshToken);
  router.post("/logout", authController.logout);
  return router;
}
