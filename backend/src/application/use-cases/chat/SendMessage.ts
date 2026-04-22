import { randomUUID } from "crypto";
import { Message, MessageContentType } from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { PermissionCheck } from "../../../domain/services/PermissionCheck";
import { MessageDTO } from "../../dtos/MessageDTO";
import { NotFoundError, UnauthorizedError } from "../../../shared/errors/AppError";

export interface SendMessageInput {
  roomId: string;
  senderId: string;
  contentType: MessageContentType;
  content: string;
}

export class SendMessageUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly permissionCheck: PermissionCheck
  ) {}

  async execute(input: SendMessageInput): Promise<MessageDTO> {
    const sender = await this.userRepository.findById(input.senderId);
    if (!sender) {
      throw new NotFoundError("Sender does not exist.");
    }

    const allowed = this.permissionCheck.can(sender, "chat:send", {
      roomId: input.roomId
    });
    if (!allowed) {
      throw new UnauthorizedError("You do not have permission to send message in this room.");
    }

    const entity = new Message({
      id: randomUUID(),
      roomId: input.roomId,
      senderId: input.senderId,
      contentType: input.contentType,
      content: input.content,
      createdAt: new Date()
    });

    const saved = await this.messageRepository.save(entity);
    return {
      id: saved.id,
      roomId: saved.roomId,
      senderId: saved.senderId,
      contentType: saved.contentType,
      content: saved.content,
      createdAt: saved.createdAt.toISOString()
    };
  }
}
