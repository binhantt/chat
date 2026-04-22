import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { PermissionCheck } from "../../../domain/services/PermissionCheck";
import { DEFAULT_HISTORY_LIMIT } from "../../../shared/constants/AppConstants";
import { NotFoundError, UnauthorizedError } from "../../../shared/errors/AppError";
import { MessageDTO } from "../../dtos/MessageDTO";

export interface GetHistoryInput {
  roomId: string;
  requesterId: string;
  limit?: number;
  before?: Date;
}

export class GetHistoryUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly permissionCheck: PermissionCheck
  ) {}

  async execute(input: GetHistoryInput): Promise<MessageDTO[]> {
    const requester = await this.userRepository.findById(input.requesterId);
    if (!requester) {
      throw new NotFoundError("Requester does not exist.");
    }

    const allowed = this.permissionCheck.can(requester, "chat:history", {
      roomId: input.roomId
    });
    if (!allowed) {
      throw new UnauthorizedError("You do not have permission to view room history.");
    }

    const history = await this.messageRepository.getRoomHistory(
      input.roomId,
      input.limit ?? DEFAULT_HISTORY_LIMIT,
      input.before
    );

    return history.map((message) => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      contentType: message.contentType,
      content: message.content,
      createdAt: message.createdAt.toISOString()
    }));
  }
}
