import { randomUUID } from "crypto";
import { Knex } from "knex";
import { IRoomRepository, RoomRecord } from "../../../domain/repositories/IRoomRepository";

interface RoomRow {
  id: string;
  participant_a: string;
  participant_b: string;
  active: number | boolean;
  identity_revealed: number | boolean;
  participant_a_liked_at: string | Date | null;
  participant_b_liked_at: string | Date | null;
  revealed_at: string | Date | null;
  created_at: string | Date;
}

const sortPair = (userAId: string, userBId: string): [string, string] =>
  userAId < userBId ? [userAId, userBId] : [userBId, userAId];

export class KnexRoomRepository implements IRoomRepository {
  constructor(private readonly db: Knex) {}

  async findById(roomId: string): Promise<RoomRecord | null> {
    const row = await this.db<RoomRow>("rooms")
      .where({ id: roomId })
      .first();

    return row ? this.mapToRecord(row) : null;
  }

  async findActiveByParticipants(userAId: string, userBId: string): Promise<RoomRecord | null> {
    const [participantA, participantB] = sortPair(userAId, userBId);

    const row = await this.db<RoomRow>("rooms")
      .where({
        participant_a: participantA,
        participant_b: participantB,
        active: true
      })
      .first();

    return row ? this.mapToRecord(row) : null;
  }

  async createPrivateRoom(userAId: string, userBId: string): Promise<RoomRecord> {
    const [participantA, participantB] = sortPair(userAId, userBId);
    const id = randomUUID();
    const createdAt = new Date();

    await this.db("rooms").insert({
      id,
      participant_a: participantA,
      participant_b: participantB,
      active: true,
      created_at: createdAt
    });

    return {
      id,
      participantA,
      participantB,
      active: true,
      identityRevealed: false,
      createdAt
    };
  }

  async likeRoom(roomId: string, userId: string): Promise<RoomRecord | null> {
    const room = await this.findById(roomId);
    if (!room) {
      return null;
    }

    const updatePayload =
      room.participantA === userId
        ? {
            participant_a_liked_at: room.participantALikedAt ?? this.db.fn.now(),
            identity_revealed: true,
            revealed_at: room.revealedAt ?? this.db.fn.now()
          }
        : room.participantB === userId
          ? {
              participant_b_liked_at: room.participantBLikedAt ?? this.db.fn.now(),
              identity_revealed: true,
              revealed_at: room.revealedAt ?? this.db.fn.now()
            }
          : null;

    if (!updatePayload) {
      return null;
    }

    await this.db("rooms")
      .where({ id: roomId })
      .update(updatePayload);

    return this.findById(roomId);
  }

  async deactivate(roomId: string): Promise<RoomRecord | null> {
    const room = await this.findById(roomId);
    if (!room) {
      return null;
    }

    await this.db("rooms")
      .where({ id: roomId })
      .update({ active: false });

    return {
      ...room,
      active: false
    };
  }

  private mapToRecord(row: RoomRow): RoomRecord {
    return {
      id: row.id,
      participantA: row.participant_a,
      participantB: row.participant_b,
      active: Boolean(row.active),
      identityRevealed: Boolean(row.identity_revealed),
      participantALikedAt: this.toDate(row.participant_a_liked_at),
      participantBLikedAt: this.toDate(row.participant_b_liked_at),
      revealedAt: this.toDate(row.revealed_at),
      createdAt: new Date(row.created_at)
    };
  }

  private toDate(value: string | Date | null): Date | undefined {
    if (!value) {
      return undefined;
    }

    return value instanceof Date ? value : new Date(value);
  }
}
