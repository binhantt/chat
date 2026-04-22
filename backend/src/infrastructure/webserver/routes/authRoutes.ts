import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export function buildAuthRoutes(authController: AuthController) {
  const router = Router();
  router.post("/login", authController.loginWithEmailPassword);
  router.post("/google", authController.loginWithGoogle);
  router.post("/google-login", authController.loginWithGoogle);
  router.post("/refresh", authController.refreshToken);
  router.post("/refresh-token", authController.refreshToken);
  router.post("/logout", authController.logout);
  return router;
}
