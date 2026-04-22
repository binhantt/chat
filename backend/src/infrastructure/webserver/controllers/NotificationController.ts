import { SendNotificationUseCase, GetNotificationsUseCase, GetUnreadCountUseCase, MarkNotificationAsReadUseCase, MarkAllNotificationsAsReadUseCase, DeleteNotificationUseCase } from "../../../application/use-cases/notifications/NotificationUseCase";

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
}
