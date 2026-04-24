import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("rooms", (table) => {
    table.boolean("identity_revealed").notNullable().defaultTo(false);
    table.timestamp("participant_a_liked_at").nullable();
    table.timestamp("participant_b_liked_at").nullable();
    table.timestamp("revealed_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("rooms", (table) => {
    table.dropColumn("revealed_at");
    table.dropColumn("participant_b_liked_at");
    table.dropColumn("participant_a_liked_at");
    table.dropColumn("identity_revealed");
  });
}
