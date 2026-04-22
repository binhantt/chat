import knex, { Knex } from "knex";

const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "banked"
  },
  pool: {
    min: 0,
    max: 10
  }
};

export const db = knex(config);
