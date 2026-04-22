import { Knex } from "knex";
import { Message, MessageContentType } from "../../../domain/entities/Message";
import { IMessageRepository } from "../../../domain/repositories/IMessageRepository";

interface MessageRow {
  id: string;
  room_id: string;
  sender_id: string;
  content_type: MessageContentType;
  content: string;
  created_at: string | Date;
}

export class KnexMessageRepository implements IMessageRepository {
  constructor(private readonly db: Knex) {}

  async save(message: Message): Promise<Message> {
    const data = message.toPrimitives();

    await this.db("messages").insert({
      id: data.id,
      room_id: data.roomId,
      sender_id: data.senderId,
      content_type: data.contentType,
      content: data.content,
      created_at: data.createdAt
    });

    return message;
  }

  async getRoomHistory(roomId: string, limit: number, before?: Date): Promise<Message[]> {
    const query = this.db<MessageRow>("messages")
      .where({ room_id: roomId })
      .orderBy("created_at", "desc")
      .limit(limit);

    if (before) {
      query.andWhere("created_at", "<", before);
    }

    const rows = await query;
    return rows
      .map(
        (row) =>
          new Message({
            id: row.id,
            roomId: row.room_id,
            senderId: row.sender_id,
            contentType: row.content_type,
            content: row.content,
            createdAt: new Date(row.created_at)
          })
      )
      .reverse();
  }
}
