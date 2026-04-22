# Notification System with Node.js Streams

This is a complete notification system implementation using Node.js streams and event-driven architecture.

## Features

✅ **Stream-based Architecture**: Uses Node.js Transform and Readable streams for efficient notification handling
✅ **Real-time Notifications**: Broadcast notifications to multiple users simultaneously
✅ **Persistent Storage**: Keeps notification history per user
✅ **Read Status Tracking**: Mark notifications as read/unread
✅ **Event Emitter Integration**: Built-in event system for notification lifecycle hooks
✅ **Type-Safe**: Full TypeScript support with DTOs

## Architecture Overview

### Components

1. **NotificationDTO** (`src/application/dtos/NotificationDTO.ts`)
   - Data transfer objects for notifications
   - Types: MESSAGE, SYSTEM, ALERT

2. **NotificationStream** (`src/infrastructure/external-services/NotificationStream.ts`)
   - Transform stream for processing notifications
   - Readable stream for consuming notifications
   - Queue management for notification buffering

3. **NotificationService** (`src/infrastructure/external-services/NotificationService.ts`)
   - Core service managing all notification operations
   - Singleton pattern for application-wide instance
   - Stream management and event emission

4. **NotificationController** (`src/infrastructure/webserver/controllers/NotificationController.ts`)
   - Express controller handling HTTP requests
   - User authentication and authorization

5. **NotificationUseCase** (`src/application/use-cases/notifications/NotificationUseCase.ts`)
   - Business logic encapsulation
   - Follows clean architecture principles

6. **Routes** (`src/infrastructure/webserver/routes/notificationRoutes.ts`)
   - RESTful API endpoints
   - ABAC middleware for authorization

## API Endpoints

### Get All Notifications
```http
GET /api/notifications?limit=50
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "a1b2c3d4e5f6",
    "userId": "user123",
    "type": "MESSAGE",
    "title": "New Message",
    "content": "Hello from Alice",
    "roomId": "room456",
    "senderId": "sender789",
    "metadata": {
      "messageId": "msg123",
      "contentType": "text"
    },
    "isRead": false,
    "createdAt": "2026-04-22T10:30:00Z"
  }
]
```

### Get Unread Count
```http
GET /api/notifications/unread
Authorization: Bearer <token>
```

Response:
```json
{
  "unreadCount": 5
}
```

### Mark Notification as Read
```http
PUT /api/notifications/{notificationId}/read
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "a1b2c3d4e5f6",
  "isRead": true,
  "readAt": "2026-04-22T10:31:00Z"
}
```

### Mark All Notifications as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>
```

Response:
```json
{
  "markedCount": 5
}
```

### Delete Notification
```http
DELETE /api/notifications/{notificationId}
Authorization: Bearer <token>
```

Response: `204 No Content`

## Usage Examples

### Sending a Notification to a User

```typescript
import { getNotificationService } from "./infrastructure/external-services/NotificationService";

const notificationService = getNotificationService();

await notificationService.sendNotification({
  userId: "user123",
  type: "MESSAGE",
  title: "New Message",
  content: "You received a new message",
  roomId: "room456",
  senderId: "sender789",
  metadata: {
    messageId: "msg123",
    contentType: "text"
  }
});
```

### Broadcasting a Notification to Multiple Users

```typescript
const userIds = ["user1", "user2", "user3"];

await notificationService.broadcastNotification(userIds, {
  type: "SYSTEM",
  title: "System Update",
  content: "Maintenance scheduled for tonight",
  metadata: {
    priority: "high"
  }
});
```

### Getting User Notifications

```typescript
const notifications = notificationService.getUserNotifications("user123", 50);
console.log(notifications);
```

### Getting Unread Count

```typescript
const unreadCount = notificationService.getUnreadCount("user123");
console.log(`You have ${unreadCount} unread notifications`);
```

### Marking as Read

```typescript
await notificationService.markAsRead("notificationId123", "user123");
await notificationService.markAllAsRead("user123");
```

### Listening to Notification Events

```typescript
const notificationService = getNotificationService();

// Listen to individual notifications
notificationService.on('notification:sent', (notification) => {
  console.log("Notification sent:", notification);
});

// Listen to broadcasts
notificationService.on('notification:broadcast', ({ userIds, notifications }) => {
  console.log(`Broadcast to ${userIds.length} users`);
});

// Listen to read status changes
notificationService.on('notification:read', (notification) => {
  console.log("Notification marked as read:", notification);
});

// Listen to all notifications
notificationService.on('notification:mark-all-read', ({ userId, count }) => {
  console.log(`User ${userId} marked ${count} notifications as read`);
});

// Listen to deletions
notificationService.on('notification:deleted', ({ notificationId, userId }) => {
  console.log(`Notification ${notificationId} deleted for user ${userId}`);
});

// Listen to errors
notificationService.on('error', (error) => {
  console.error("Notification service error:", error);
});
```

### Working with Streams

```typescript
// Create a stream for a specific user
const userStream = notificationService.createUserStream("user123");

// Listen to notifications as they come
userStream.on('data', (notification) => {
  console.log("New notification:", notification);
});

userStream.on('error', (error) => {
  console.error("Stream error:", error);
});

// Get readable stream of user's notifications
const readableStream = notificationService.getUserNotificationStream("user123");

readableStream.on('data', (notification) => {
  console.log("Reading notification:", notification);
});
```

### Integration with Chat Controller

The `ChatController` has been updated to automatically send notifications when messages are sent:

```typescript
// In sendMessage method:
await notificationService.broadcastNotification(
  roomMembers.filter(id => id !== senderId),
  {
    type: 'MESSAGE',
    title: 'New Message',
    content: message.content,
    roomId: message.roomId,
    senderId: message.senderId,
    metadata: {
      messageId: message.id,
      contentType: message.contentType
    }
  }
);
```

## Stream Flow

```
NotificationPayload
     ↓
NotificationService.sendNotification()
     ↓
NotificationStream (Transform)
     ├→ Enrich with ID, timestamps
     ├→ Add to queue
     └→ Pass to callback
     ↓
PassThrough Stream
     ↓
User Notifications Storage + Events
```

## Performance Considerations

- **Backpressure Handling**: Streams implement backpressure to handle high volumes
- **Queue Limit**: Default `highWaterMark` is 16 (configurable)
- **Memory Management**: Notifications are stored in memory; consider database persistence for production
- **Event Listeners**: Listeners are automatically managed and cleaned up

## Production Recommendations

1. **Database Persistence**: Store notifications in database instead of memory
2. **Message Queue**: Use Redis or RabbitMQ for distributed notifications
3. **WebSocket Integration**: Add WebSocket support for real-time updates
4. **Rate Limiting**: Implement rate limiting on notification endpoints
5. **Cleanup**: Periodically clean up old notifications
6. **Monitoring**: Add logging and metrics for notification system health

## Example: Database-backed Persistence

```typescript
// Create a repository for persistent storage
export class DatabaseNotificationRepository {
  async save(notification: NotificationDTO): Promise<void> {
    await db('notifications').insert(notification);
  }

  async getByUserId(userId: string): Promise<NotificationDTO[]> {
    return await db('notifications').where('user_id', userId);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await db('notifications')
      .where('id', notificationId)
      .update({ is_read: true, read_at: new Date() });
  }
}

// Use it in NotificationService
const repo = new DatabaseNotificationRepository();
const notification = await service.sendNotification(payload);
await repo.save(notification);
```

## Testing

The notification system supports unit testing:

```typescript
import { NotificationService } from "../infrastructure/external-services/NotificationService";

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  afterEach(() => {
    service.destroy();
  });

  test('should send notification to user', async () => {
    const notification = await service.sendNotification({
      userId: 'test-user',
      type: 'MESSAGE',
      title: 'Test',
      content: 'Test content'
    });

    expect(notification.userId).toBe('test-user');
    expect(notification.isRead).toBe(false);
  });

  test('should mark notification as read', async () => {
    const notification = await service.sendNotification({
      userId: 'test-user',
      type: 'MESSAGE',
      title: 'Test',
      content: 'Test content'
    });

    await service.markAsRead(notification.id, 'test-user');
    const unreadCount = service.getUnreadCount('test-user');

    expect(unreadCount).toBe(0);
  });
});
```

## Cleanup

Always clean up resources when the application shuts down:

```typescript
// In main.ts or shutdown handler
process.on('SIGTERM', () => {
  const notificationService = getNotificationService();
  notificationService.destroy();
  process.exit(0);
});
```

## Troubleshooting

**Notifications not being sent**
- Check that the user exists and has proper permissions
- Verify ABAC middleware is correctly configured
- Check event listeners for errors

**High memory usage**
- Reduce notification retention period
- Implement database persistence
- Monitor queue sizes

**Stream errors**
- Check for stream piping issues
- Ensure proper error listeners
- Verify backpressure handling

---

Built with Node.js Streams for efficient, scalable notification handling.
