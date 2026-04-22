import { Readable, Transform } from 'stream';
import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';
import { NotificationDTO } from '../../application/dtos/NotificationDTO';

function generateId(): string {
  return randomBytes(6).toString('hex');
}

export class NotificationStream extends Transform {
  private notificationQueue: NotificationDTO[] = [];
  private isProcessing = false;

  constructor(options: any = {}) {
    super({
      objectMode: true,
      highWaterMark: options.highWaterMark || 16,
      ...options
    });
  }

  _transform(
    notification: NotificationDTO,
    encoding: string,
    callback: (error?: Error | null, data?: any) => void
  ): void {
    try {
      // Enrich notification with metadata
      const enrichedNotification: NotificationDTO = {
        ...notification,
        id: notification.id || generateId(),
        isRead: notification.isRead || false,
        createdAt: notification.createdAt || new Date()
      };

      // Add processing timestamp
      const processedData = {
        ...enrichedNotification,
        processedAt: new Date().toISOString()
      };

      this.notificationQueue.push(enrichedNotification);
      callback(null, processedData);
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback: (error?: Error | null) => void): void {
    this.notificationQueue = [];
    callback();
  }

  getQueueLength(): number {
    return this.notificationQueue.length;
  }

  clearQueue(): void {
    this.notificationQueue = [];
  }

  getQueue(): NotificationDTO[] {
    return [...this.notificationQueue];
  }
}

export class NotificationReadableStream extends Readable {
  private notifications: NotificationDTO[] = [];
  private index = 0;
  private interval: NodeJS.Timeout | null = null;

  constructor(notifications: NotificationDTO[], options: any = {}) {
    super({
      objectMode: true,
      ...options
    });
    this.notifications = notifications;
  }

  _read(): void {
    if (this.index < this.notifications.length) {
      const notification = this.notifications[this.index];
      this.push(notification);
      this.index++;
    } else {
      this.push(null);
    }
  }

  addNotification(notification: NotificationDTO): void {
    this.notifications.push(notification);
  }

  getNotifications(): NotificationDTO[] {
    return this.notifications;
  }
}
