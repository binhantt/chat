import { Router } from "express";
import { UsersController } from "../controllers/UsersController";

export function buildUsersRoutes(
  usersController: UsersController,
  readProfileMiddleware: any,
  updateProfileMiddleware: any
) {
  const router = Router();

  router.get("/profile", readProfileMiddleware, usersController.getProfile);
  router.put("/profile", updateProfileMiddleware, usersController.updateProfile);

  return router;
}
