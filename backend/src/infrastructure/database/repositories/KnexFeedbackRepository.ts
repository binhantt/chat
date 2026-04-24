import { randomUUID } from "crypto";
import { Knex } from "knex";
import {
  CreateFeedbackInput,
  FeedbackRecord,
  IFeedbackRepository
} from "../../../domain/repositories/IFeedbackRepository";

interface FeedbackRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string | Date;
}

export class KnexFeedbackRepository implements IFeedbackRepository {
  constructor(private readonly db: Knex) {}

  async create(input: CreateFeedbackInput): Promise<FeedbackRecord> {
    const id = randomUUID();
    const createdAt = new Date();

    await this.db("feedbacks").insert({
      id,
      user_id: input.userId,
      title: input.title,
      content: input.content,
      created_at: createdAt
    });

    return {
      id,
      userId: input.userId,
      title: input.title,
      content: input.content,
      createdAt
    };
  }

  async getByUserId(userId: string): Promise<FeedbackRecord[]> {
    const rows = await this.db<FeedbackRow>("feedbacks")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");

    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      createdAt: new Date(row.created_at)
    }));
  }
}
