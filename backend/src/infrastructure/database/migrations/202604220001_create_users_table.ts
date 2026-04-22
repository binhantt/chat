import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.string("id", 64).primary();
    table.string("google_id", 128).unique().nullable();
    table.string("email", 255).nullable();
    table.string("display_name", 120).notNullable();
    table.integer("trust_score").notNullable().defaultTo(50);
    table.text("attributes").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
