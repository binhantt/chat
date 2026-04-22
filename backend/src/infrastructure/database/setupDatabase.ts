import "dotenv/config";
import mysql from "mysql2/promise";
import { ValidationError } from "../../shared/errors/AppError";

function getDatabaseName(): string {
  const database = process.env.DB_NAME ?? "banked";
  if (!/^[A-Za-z0-9_-]+$/.test(database)) {
    throw new ValidationError("DB_NAME contains invalid characters.");
  }
  return database;
}

export async function setupDatabase(): Promise<void> {
  const database = getDatabaseName();
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? ""
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database '${database}' is ready.`);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
}
