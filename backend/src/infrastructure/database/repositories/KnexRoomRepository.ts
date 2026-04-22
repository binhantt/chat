import { randomUUID } from "crypto";
import { Knex } from "knex";
import { IRoomRepository, RoomRecord } from "../../../domain/repositories/IRoomRepository";

interface RoomRow {
  id: string;
  participant_a: string;
  participant_b: string;
  active: number | boolean;
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
      createdAt
    };
  }

  private mapToRecord(row: RoomRow): RoomRecord {
    return {
      id: row.id,
      participantA: row.participant_a,
      participantB: row.participant_b,
      active: Boolean(row.active),
      createdAt: new Date(row.created_at)
    };
  }
}
