import { SendNotificationUseCase, GetNotificationsUseCase, GetUnreadCountUseCase, MarkNotificationAsReadUseCase, MarkAllNotificationsAsReadUseCase, DeleteNotificationUseCase } from "../../../application/use-cases/notifications/NotificationUseCase";
import { NotificationDTO } from "../../../application/dtos/NotificationDTO";
import { getNotificationService } from "../../external-services/NotificationService";

export class NotificationController {
  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase
  ) {}

  getNotifications = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;
      const limit = req.query?.limit ? Number(req.query.limit) : 50;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notifications = await this.getNotificationsUseCase.execute(userId, limit);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await this.getUnreadCountUseCase.execute(userId);
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;
      const notificationId = req.params?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const notification = await this.markAsReadUseCase.execute(notificationId, userId);

      if (!notification) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const count = await this.markAllAsReadUseCase.execute(userId);
      res.status(200).json({ markedCount: count });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;
      const notificationId = req.params?.id;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const deleted = await this.deleteNotificationUseCase.execute(notificationId, userId);

      if (!deleted) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  streamNotifications = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const userId = req.currentUser?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      const notificationService = getNotificationService();
      const toSsePayload = (notification: NotificationDTO) => ({
        ...notification,
        createdAt:
          notification.createdAt instanceof Date
            ? notification.createdAt.toISOString()
            : notification.createdAt,
        readAt:
          notification.readAt instanceof Date
            ? notification.readAt.toISOString()
            : notification.readAt
      });

      res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);

      const handleNotification = (notification: NotificationDTO) => {
        if (notification.userId !== userId) return;
        res.write(`event: notification\ndata: ${JSON.stringify(toSsePayload(notification))}\n\n`);
      };

      notificationService.on("notification:sent", handleNotification);

      const heartbeat = setInterval(() => {
        res.write("event: ping\ndata: {}\n\n");
      }, 25000);

      req.on("close", () => {
        clearInterval(heartbeat);
        notificationService.off("notification:sent", handleNotification);
        res.end();
      });
    } catch (error) {
      next(error);
    }
  };
}
