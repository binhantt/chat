import { EventEmitter } from 'events';
import { PassThrough } from 'stream';
import { randomBytes } from 'crypto';
import { NotificationDTO, NotificationPayload } from '../../application/dtos/NotificationDTO';
import { NotificationStream, NotificationReadableStream } from './NotificationStream';

function generateId(): string {
  return randomBytes(6).toString('hex');
}

export class NotificationService extends EventEmitter {
  private notificationStreams = new Map<string, NotificationStream>();
  private userNotifications = new Map<string, NotificationDTO[]>();
  private passthrough = new PassThrough({ objectMode: true });

  constructor() {
    super();
    this.setupErrorHandling();
  }

  /**
   * Create a notification stream for a specific user
   */
  createUserStream(userId: string): NotificationStream {
    if (this.notificationStreams.has(userId)) {
      return this.notificationStreams.get(userId)!;
    }

    const stream = new NotificationStream();
    this.notificationStreams.set(userId, stream);

    // Pipe stream to passthrough for event broadcasting
    stream.pipe(this.passthrough);

    // Initialize user notifications array
    if (!this.userNotifications.has(userId)) {
      this.userNotifications.set(userId, []);
    }

    return stream;
  }

  /**
   * Send a notification to a specific user
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationDTO> {
    const notification: NotificationDTO = {
      id: generateId(),
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      roomId: payload.roomId,
      senderId: payload.senderId,
      metadata: payload.metadata,
      isRead: false,
      createdAt: new Date()
    };

    // Store notification
    const userNotifs = this.userNotifications.get(payload.userId) || [];
    userNotifs.push(notification);
    this.userNotifications.set(payload.userId, userNotifs);

    // Send through stream
    const stream = this.createUserStream(payload.userId);
    stream.write(notification);

    // Emit event
    this.emit('notification:sent', notification);
    this.passthrough.write(notification);

    return notification;
  }

  /**
   * Broadcast a notification to multiple users
   */
  async broadcastNotification(
    userIds: string[],
    payload: Omit<NotificationPayload, 'userId'>
  ): Promise<NotificationDTO[]> {
    const notifications = await Promise.all(
      userIds.map(userId =>
        this.sendNotification({
          ...payload,
          userId
        })
      )
    );

    this.emit('notification:broadcast', { userIds, notifications });
    return notifications;
  }

  /**
   * Get user notification stream as readable stream
   */
  getUserNotificationStream(userId: string): NotificationReadableStream {
    const notifications = this.userNotifications.get(userId) || [];
    return new NotificationReadableStream(notifications);
  }

  /**
   * Get all notifications for a user
   */
  getUserNotifications(userId: string, limit: number = 50): NotificationDTO[] {
    const notifications = this.userNotifications.get(userId) || [];
    return notifications.slice(-limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDTO | null> {
    const notifications = this.userNotifications.get(userId) || [];
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      this.emit('notification:read', notification);
      return notification;
    }

    return null;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const notifications = this.userNotifications.get(userId) || [];
    let count = 0;

    notifications.forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date();
        count++;
      }
    });

    this.emit('notification:mark-all-read', { userId, count });
    return count;
  }

  /**
   * Get unread notification count for a user
   */
  getUnreadCount(userId: string): number {
    const notifications = this.userNotifications.get(userId) || [];
    return notifications.filter(n => !n.isRead).length;
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string, userId: string): boolean {
    const notifications = this.userNotifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      notifications.splice(index, 1);
      this.emit('notification:deleted', { notificationId, userId });
      return true;
    }

    return false;
  }

  /**
   * Delete all notifications for a user
   */
  deleteAllNotifications(userId: string): number {
    const notifications = this.userNotifications.get(userId) || [];
    const count = notifications.length;
    this.userNotifications.set(userId, []);
    this.emit('notification:delete-all', { userId, count });
    return count;
  }

  /**
   * Get passthrough stream for all notifications
   */
  getNotificationStream() {
    return this.passthrough;
  }

  /**
   * Close user stream
   */
  closeUserStream(userId: string): void {
    const stream = this.notificationStreams.get(userId);
    if (stream) {
      stream.destroy();
      this.notificationStreams.delete(userId);
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.passthrough.on('error', (error) => {
      this.emit('error', error);
      console.error('NotificationService PassThrough Error:', error);
    });
  }

  /**
   * Destroy all streams and clear data
   */
  destroy(): void {
    this.notificationStreams.forEach((stream) => {
      stream.destroy();
    });
    this.notificationStreams.clear();
    this.userNotifications.clear();
    this.passthrough.destroy();
  }
}

// Singleton instance
let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}
