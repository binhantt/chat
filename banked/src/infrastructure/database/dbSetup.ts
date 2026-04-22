import "dotenv/config";
import { db } from "./connection";
import { runMigrations } from "./runMigrations";
import { setupDatabase } from "./setupDatabase";

async function dbSetup(): Promise<void> {
  await setupDatabase();
  await runMigrations();
}

if (require.main === module) {
  dbSetup()
    .then(() => {
      console.log("Database setup completed.");
    })
    .catch((error) => {
      console.error("Database setup failed:", error);
      process.exit(1);
    })
    .finally(async () => {
      await db.destroy();
    });
}

export { dbSetup };
