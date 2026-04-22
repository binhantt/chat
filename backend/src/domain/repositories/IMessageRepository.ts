import { Message } from "../entities/Message";

export interface IMessageRepository {
  save(message: Message): Promise<Message>;
  getRoomHistory(roomId: string, limit: number, before?: Date): Promise<Message[]>;
}
