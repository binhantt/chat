import { Knex } from "knex";

interface LegacyUserRow {
  id: string;
  attributes: string | null;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VN_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

const normalizeGender = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "male") return "nam";
  if (normalized === "female") return "nu";
  if (normalized === "other") return "khac";

  return normalized;
};

const normalizeBirthDate = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (ISO_DATE_PATTERN.test(normalized)) {
    return normalized;
  }

  if (VN_DATE_PATTERN.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.valueOf())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("chi_tiet_ca_nhan", (table) => {
    table.string("user_id", 64).primary();
    table.string("gender", 32).nullable();
    table.date("birth_date").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table
      .foreign("user_id")
      .references("users.id")
      .onDelete("CASCADE");
  });

  const users = await knex<LegacyUserRow>("users").select("id", "attributes");
  const rowsToInsert = users
    .map((user) => {
      if (!user.attributes) {
        return null;
      }

      try {
        const attributes = JSON.parse(user.attributes) as Record<string, unknown>;
        const gender = normalizeGender(attributes.gender);
        const birthDate = normalizeBirthDate(attributes.birthDate);

        if (!gender && !birthDate) {
          return null;
        }

        return {
          user_id: user.id,
          gender,
          birth_date: birthDate
        };
      } catch {
        return null;
      }
    })
    .filter((row): row is { user_id: string; gender: string | null; birth_date: string | null } => Boolean(row));

  if (rowsToInsert.length > 0) {
    await knex("chi_tiet_ca_nhan").insert(rowsToInsert);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("chi_tiet_ca_nhan");
}
