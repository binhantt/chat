import { MessageContentType } from "../../domain/entities/Message";

export interface MessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  contentType: MessageContentType;
  content: string;
  createdAt: string;
}
