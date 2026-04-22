import { GetHistoryUseCase } from "../../../application/use-cases/chat/GetHistory";
import { SendMessageUseCase } from "../../../application/use-cases/chat/SendMessage";
import { getNotificationService } from "../../external-services/NotificationService";

export class ChatController {
  constructor(
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase
  ) {}

  sendMessage = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const payload = {
        roomId: req.body?.roomId,
        senderId: req.currentUser?.id ?? req.body?.senderId,
        contentType: req.body?.contentType,
        content: req.body?.content
      };

      const message = await this.sendMessageUseCase.execute(payload);

      // Emit notification to other users in the room
      const notificationService = getNotificationService();
      const roomMembers = req.body?.roomMembers || []; // Should be passed or fetched

      if (roomMembers.length > 0) {
        await notificationService.broadcastNotification(
          roomMembers.filter((memberId: string) => memberId !== message.senderId),
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
      }

      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: any, res: any, next: any): Promise<void> => {
    try {
      const history = await this.getHistoryUseCase.execute({
        roomId: req.params?.roomId,
        requesterId: req.currentUser?.id ?? req.query?.requesterId,
        limit: req.query?.limit ? Number(req.query.limit) : undefined,
        before: req.query?.before ? new Date(req.query.before) : undefined
      });

      res.status(200).json(history);
    } catch (error) {
      next(error);
    }
  };
}
