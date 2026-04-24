import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

export function buildChatRoutes(
  chatController: ChatController,
  sendMessageMiddleware: any,
  getHistoryMiddleware: any,
  getUsersMiddleware: any,
  searchMatchMiddleware: any,
  leaveRoomMiddleware: any
) {
  const router = Router();

  router.post("/messages", sendMessageMiddleware, chatController.sendMessage);
  router.get("/rooms/:roomId", getHistoryMiddleware, chatController.getRoom);
  router.get("/rooms/:roomId/history", getHistoryMiddleware, chatController.getHistory);
  router.post("/rooms/:roomId/like", leaveRoomMiddleware, chatController.likeRoom);
  router.post("/rooms/:roomId/leave", leaveRoomMiddleware, chatController.leaveRoom);
  router.get("/users", getUsersMiddleware, chatController.getUsers);
  router.post("/matchmaking/search", searchMatchMiddleware, chatController.searchMatch);
  router.delete("/matchmaking/search", searchMatchMiddleware, chatController.cancelMatchSearch);

  return router;
}
