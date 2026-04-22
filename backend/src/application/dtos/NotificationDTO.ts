export interface NotificationDTO {
  id: string;
  userId: string;
  type: 'MESSAGE' | 'SYSTEM' | 'ALERT';
  title: string;
  content: string;
  roomId?: string;
  senderId?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPayload {
  userId: string;
  type: 'MESSAGE' | 'SYSTEM' | 'ALERT';
  title: string;
  content: string;
  roomId?: string;
  senderId?: string;
  metadata?: Record<string, any>;
}
