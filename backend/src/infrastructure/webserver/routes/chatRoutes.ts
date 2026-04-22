const { Router } = require("express");
import { ChatController } from "../controllers/ChatController";

export function buildChatRoutes(
  chatController: ChatController,
  sendMessageMiddleware: any,
  getHistoryMiddleware: any
) {
  const router = Router();

  router.post("/messages", sendMessageMiddleware, chatController.sendMessage);
  router.get("/rooms/:roomId/history", getHistoryMiddleware, chatController.getHistory);

  return router;
}
