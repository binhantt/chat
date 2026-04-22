import { SendNotificationUseCase, GetNotificationsUseCase, GetUnreadCountUseCase, MarkNotificationAsReadUseCase, MarkAllNotificationsAsReadUseCase, DeleteNotificationUseCase } from "../../../application/use-cases/notifications/NotificationUseCase";
import { NotificationController } from "../controllers/NotificationController";

export function buildNotificationRoutes() {
  const sendNotificationUseCase = new SendNotificationUseCase();
  const getNotificationsUseCase = new GetNotificationsUseCase();
  const getUnreadCountUseCase = new GetUnreadCountUseCase();
  const markAsReadUseCase = new MarkNotificationAsReadUseCase();
  const markAllAsReadUseCase = new MarkAllNotificationsAsReadUseCase();
  const deleteNotificationUseCase = new DeleteNotificationUseCase();

  const notificationController = new NotificationController(
    sendNotificationUseCase,
    getNotificationsUseCase,
    getUnreadCountUseCase,
    markAsReadUseCase,
    markAllAsReadUseCase,
    deleteNotificationUseCase
  );

  return {
    streamNotifications: notificationController.streamNotifications,
    getNotifications: notificationController.getNotifications,
    getUnreadCount: notificationController.getUnreadCount,
    markAsRead: notificationController.markAsRead,
    markAllAsRead: notificationController.markAllAsRead,
    deleteNotification: notificationController.deleteNotification
  };
}
