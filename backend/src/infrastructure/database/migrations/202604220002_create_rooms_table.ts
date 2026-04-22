import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("rooms", (table) => {
    table.string("id", 64).primary();
    table.string("participant_a", 64).notNullable();
    table.string("participant_b", 64).notNullable();
    table.boolean("active").notNullable().defaultTo(true);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .foreign("participant_a")
      .references("users.id")
      .onDelete("CASCADE");
    table
      .foreign("participant_b")
      .references("users.id")
      .onDelete("CASCADE");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rooms");
}
