import { Knex } from "knex";
import { PersonalDetailProps } from "../../../domain/entities/PersonalDetail";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

interface UserRow {
  id: string;
  google_id: string | null;
  email: string | null;
  display_name: string;
  trust_score: number;
  attributes: Record<string, string | number | boolean | null> | string | null;
  personal_gender: string | null;
  personal_birth_date: string | Date | null;
}

export class KnexUserRepository implements IUserRepository {
  constructor(private readonly db: Knex) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.baseQuery().where("users.id", id).first();
    return row ? this.mapToEntity(row) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const row = await this.baseQuery().where("users.google_id", googleId).first();
    return row ? this.mapToEntity(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const row = await this.baseQuery()
      .whereRaw("LOWER(users.email) = ?", [normalizedEmail])
      .first();
    return row ? this.mapToEntity(row) : null;
  }

  async search(keyword?: string, limit = 20): Promise<User[]> {
    const query = this.baseQuery()
      .orderBy("users.updated_at", "desc")
      .limit(limit);

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
      const normalized = `%${trimmedKeyword.toLowerCase()}%`;
      query.where((builder) => {
        builder
          .whereRaw("LOWER(users.display_name) LIKE ?", [normalized])
          .orWhereRaw("LOWER(users.email) LIKE ?", [normalized]);
      });
    }

    const rows = await query;
    return rows.map((row) => this.mapToEntity(row));
  }

  async save(user: User): Promise<User> {
    const data = user.toPrimitives();
    await this.db.transaction(async (trx) => {
      await trx("users").insert({
        id: data.id,
        google_id: data.googleId ?? null,
        email: data.email ?? null,
        display_name: data.displayName,
        trust_score: data.trustScore,
        attributes: data.attributes ? JSON.stringify(data.attributes) : null
      });
      await this.persistPersonalDetail(trx, data.id, data.personalDetail);
    });

    return user;
  }

  async update(user: User): Promise<User> {
    const data = user.toPrimitives();
    await this.db.transaction(async (trx) => {
      await trx("users")
        .where({ id: data.id })
        .update({
          google_id: data.googleId ?? null,
          email: data.email ?? null,
          display_name: data.displayName,
          trust_score: data.trustScore,
          attributes: data.attributes ? JSON.stringify(data.attributes) : null,
          updated_at: trx.fn.now()
        });
      await this.persistPersonalDetail(trx, data.id, data.personalDetail);
    });

    return user;
  }

  private baseQuery() {
    return this.db<UserRow>("users")
      .leftJoin("chi_tiet_ca_nhan", "users.id", "chi_tiet_ca_nhan.user_id")
      .select(
        "users.id",
        "users.google_id",
        "users.email",
        "users.display_name",
        "users.trust_score",
        "users.attributes",
        "chi_tiet_ca_nhan.gender as personal_gender",
        "chi_tiet_ca_nhan.birth_date as personal_birth_date"
      );
  }

  private async persistPersonalDetail(
    trx: Knex.Transaction,
    userId: string,
    personalDetail?: PersonalDetailProps
  ): Promise<void> {
    const detail = this.toPersonalDetailRow(personalDetail);
    
    await trx("chi_tiet_ca_nhan").where({ user_id: userId }).del();

    if (!detail) {
      return;
    }

    await trx("chi_tiet_ca_nhan").insert({
      user_id: userId,
      ...detail
    });
  }

  private toPersonalDetailRow(personalDetail?: PersonalDetailProps) {
    if (!personalDetail?.gender && !personalDetail?.birthDate) {
      return null;
    }

    return {
      gender: personalDetail?.gender ?? null,
      birth_date: personalDetail?.birthDate ?? null
    };
  }

  private mapToEntity(row: UserRow): User {
    const attributes = this.normalizeAttributes(row.attributes);

    const personalDetail: PersonalDetailProps | undefined =
      row.personal_gender || row.personal_birth_date
        ? {
            gender: row.personal_gender ?? undefined,
            birthDate: this.normalizeBirthDate(row.personal_birth_date)
          }
        : undefined;

    return new User({
      id: row.id,
      googleId: row.google_id ?? undefined,
      email: row.email ?? undefined,
      displayName: row.display_name,
      trustScore: row.trust_score,
      attributes,
      personalDetail
    });
  }

  private normalizeBirthDate(value: string | Date | null): string | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return this.formatDateInLocalTimezone(value);
    }

    const normalized = String(value).trim();
    if (!normalized) {
      return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return normalized;
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.valueOf())) {
      return normalized;
    }

    return this.formatDateInLocalTimezone(parsed);
  }

  private normalizeAttributes(
    value: UserRow["attributes"]
  ): Record<string, string | number | boolean | null> | undefined {
    if (!value) {
      return undefined;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value) as Record<string, string | number | boolean | null>;
      } catch (error) {
        console.error("Failed to parse user attributes (malformed JSON):", value, error);
        return undefined;
      }
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return { ...value };
    }

    console.warn("User attributes are in an unsupported format:", value);
    return undefined;
  }

  private formatDateInLocalTimezone(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
