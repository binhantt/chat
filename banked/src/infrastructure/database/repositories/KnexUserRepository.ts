import { Knex } from "knex";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

interface UserRow {
  id: string;
  google_id: string | null;
  email: string | null;
  display_name: string;
  trust_score: number;
  attributes: unknown;
}

export class KnexUserRepository implements IUserRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db<UserRow>("users").where({ id }).first();
    return row ? this.mapToEntity(row) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const row = await this.db<UserRow>("users").where({ google_id: googleId }).first();
    return row ? this.mapToEntity(row) : null;
  }

  async save(user: User): Promise<User> {
    const data = user.toPrimitives();
    await this.db("users").insert({
      id: data.id,
      google_id: data.googleId ?? null,
      email: data.email ?? null,
      display_name: data.displayName,
      trust_score: data.trustScore,
      attributes: JSON.stringify(data.attributes)
    });
    return user;
  }

  async update(user: User): Promise<User> {
    const data = user.toPrimitives();
    await this.db("users")
      .where({ id: data.id })
      .update({
        google_id: data.googleId ?? null,
        email: data.email ?? null,
        display_name: data.displayName,
        trust_score: data.trustScore,
        attributes: JSON.stringify(data.attributes),
        updated_at: this.db.fn.now()
      });
    return user;
  }

  private mapToEntity(row: UserRow): User {
    const parsedAttributes =
      typeof row.attributes === "string"
        ? JSON.parse(row.attributes)
        : row.attributes ?? {};

    return new User({
      id: row.id,
      googleId: row.google_id ?? undefined,
      email: row.email ?? undefined,
      displayName: row.display_name,
      trustScore: row.trust_score,
      attributes: parsedAttributes as Record<string, string | number | boolean>
    });
  }
}
