import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("messages", (table) => {
    table.string("id", 64).primary();
    table.string("room_id", 64).notNullable();
    table.string("sender_id", 64).notNullable();
    table.string("content_type", 20).notNullable();
    table.text("content").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.foreign("room_id").references("rooms.id").onDelete("CASCADE");
    table.foreign("sender_id").references("users.id").onDelete("CASCADE");
    table.index(["room_id", "created_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("messages");
}
