import { getNotificationService } from "../../../infrastructure/external-services/NotificationService";
import { NotificationDTO, NotificationPayload } from "../../dtos/NotificationDTO";

export class SendNotificationUseCase {
  execute = async (payload: NotificationPayload): Promise<NotificationDTO> => {
    const notificationService = getNotificationService();
    return await notificationService.sendNotification(payload);
  };
}

export class GetNotificationsUseCase {
  execute = async (
    userId: string,
    limit: number = 50
  ): Promise<NotificationDTO[]> => {
    const notificationService = getNotificationService();
    return notificationService.getUserNotifications(userId, limit);
  };
}

export class GetUnreadCountUseCase {
  execute = async (userId: string): Promise<number> => {
    const notificationService = getNotificationService();
    return notificationService.getUnreadCount(userId);
  };
}

export class MarkNotificationAsReadUseCase {
  execute = async (
    notificationId: string,
    userId: string
  ): Promise<NotificationDTO | null> => {
    const notificationService = getNotificationService();
    return await notificationService.markAsRead(notificationId, userId);
  };
}

export class MarkAllNotificationsAsReadUseCase {
  execute = async (userId: string): Promise<number> => {
    const notificationService = getNotificationService();
    return await notificationService.markAllAsRead(userId);
  };
}

export class DeleteNotificationUseCase {
  execute = async (notificationId: string, userId: string): Promise<boolean> => {
    const notificationService = getNotificationService();
    return notificationService.deleteNotification(notificationId, userId);
  };
}
