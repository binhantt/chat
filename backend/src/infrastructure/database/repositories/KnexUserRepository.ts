import { Knex } from "knex";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

interface UserRow {
  id: string;
  google_id: string | null;
  email: string | null;
  display_name: string;
  trust_score: number;
  attributes: string | null;
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
      attributes: data.attributes ? JSON.stringify(data.attributes) : null
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
        attributes: data.attributes ? JSON.stringify(data.attributes) : null,
        updated_at: this.db.fn.now()
      });
    return user;
  }

  private mapToEntity(row: UserRow): User {
    let attributes: Record<string, string | number | boolean | null> | undefined = undefined;
    
    if (row.attributes) {
      if (typeof row.attributes === 'string') { // Ensure it's a string before parsing
        try {
          attributes = JSON.parse(row.attributes);
        } catch (e) {
          console.error("Failed to parse user attributes (malformed JSON):", row.attributes, e);
          attributes = undefined; // Explicitly set to undefined if parsing fails
        }
      } else {
        console.warn("User attributes are not a string, cannot parse:", row.attributes);
        attributes = undefined; // Not a string, treat as undefined
      }
    }

    return new User({
      id: row.id,
      googleId: row.google_id ?? undefined,
      email: row.email ?? undefined,
      displayName: row.display_name,
      trustScore: row.trust_score,
      attributes
    });
  }
}
