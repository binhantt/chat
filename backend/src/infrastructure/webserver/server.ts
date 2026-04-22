import "dotenv/config";
import express from "express"; // Changed require to import
import cors from "cors"; // Import cors
import { LoginWithGoogleUseCase } from "../../application/use-cases/auth/LoginWithGoogle";
import { RefreshTokenUseCase } from "../../application/use-cases/auth/RefreshToken";
import { GetHistoryUseCase } from "../../application/use-cases/chat/GetHistory";
import { SendMessageUseCase } from "../../application/use-cases/chat/SendMessage";
import { PermissionCheck } from "../../domain/services/PermissionCheck";
import { db } from "../database/connection";
import { KnexMessageRepository } from "../database/repositories/KnexMessageRepository";
import { KnexUserRepository } from "../database/repositories/KnexUserRepository";
import { GoogleAuth } from "../external-services/GoogleAuth";
import { createAbacMiddleware } from "../security/AbacMiddleware";
import { JwtStrategy } from "../security/JwtStrategy";
import { AuthController } from "./controllers/AuthController";
import { ChatController } from "./controllers/ChatController";
import { buildAuthRoutes } from "./routes/authRoutes";
import { buildChatRoutes } from "./routes/chatRoutes";
import { buildNotificationRoutes } from "./routes/notificationRoutes";
import { AppError } from "../../shared/errors/AppError";
import { getNotificationService } from "../external-services/NotificationService";

const app = express();
app.use(express.json());

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent
  })
);

const userRepository = new KnexUserRepository(db);
const messageRepository = new KnexMessageRepository(db);
const permissionCheck = new PermissionCheck();
const googleAuth = new GoogleAuth();
const jwtStrategy = new JwtStrategy();

const loginWithGoogleUseCase = new LoginWithGoogleUseCase(userRepository, googleAuth);
const refreshTokenUseCase = new RefreshTokenUseCase(jwtStrategy);
const sendMessageUseCase = new SendMessageUseCase(
  userRepository,
  messageRepository,
  permissionCheck
);
const getHistoryUseCase = new GetHistoryUseCase(
  userRepository,
  messageRepository,
  permissionCheck
);

const authController = new AuthController(
  loginWithGoogleUseCase,
  refreshTokenUseCase,
  jwtStrategy
);
const chatController = new ChatController(sendMessageUseCase, getHistoryUseCase);

app.get("/health", (_req: any, res: any) => {
  res.status(200).json({
    service: "banked-backend",
    status: "ok",
    at: new Date().toISOString()
  });
});

// Initialize notification service
const notificationService = getNotificationService();

app.use("/api/auth", buildAuthRoutes(authController));
app.use(
  "/api/chat",
  buildChatRoutes(
    chatController,
    createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "chat:send"),
    createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "chat:history")
  )
);

const notificationRoutes = buildNotificationRoutes();
app.get(
  "/api/notifications",
  createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "notifications:read"),
  notificationRoutes.getNotifications
);
app.get(
  "/api/notifications/unread",
  createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "notifications:read"),
  notificationRoutes.getUnreadCount
);
app.put(
  "/api/notifications/:id/read",
  createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "notifications:update"),
  notificationRoutes.markAsRead
);
app.put(
  "/api/notifications/mark-all-read",
  createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "notifications:update"),
  notificationRoutes.markAllAsRead
);
app.delete(
  "/api/notifications/:id",
  createAbacMiddleware(userRepository, permissionCheck, jwtStrategy, "notifications:delete"),
  notificationRoutes.deleteNotification
);

app.use((error: any, _req: any, res: any, _next: any) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message
    });
  }

  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: error instanceof Error ? error.message : "Unknown server error."
  });
});

const port = Number(process.env.PORT ?? 3000);

export { app, port };
