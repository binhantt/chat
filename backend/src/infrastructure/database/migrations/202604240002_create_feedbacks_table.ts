import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("feedbacks", (table) => {
    table.string("id", 64).primary();
    table.string("user_id", 64).notNullable();
    table.string("title", 255).notNullable();
    table.text("content").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.foreign("user_id").references("users.id").onDelete("CASCADE");
    table.index(["user_id", "created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("feedbacks");
}
