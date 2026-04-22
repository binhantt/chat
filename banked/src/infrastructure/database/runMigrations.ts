import "dotenv/config";
import path from "path";
import { db } from "./connection";

export async function runMigrations(): Promise<void> {
  const migrationDirectory = path.join(__dirname, "migrations");
  const [batchNo, migrations] = await db.migrate.latest({
    directory: migrationDirectory
  });

  if (migrations.length === 0) {
    console.log("No new migrations.");
  } else {
    console.log(`Migration batch ${batchNo} applied:`);
    migrations.forEach((name) => console.log(`- ${name}`));
  }
}

if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    })
    .finally(async () => {
      await db.destroy();
    });
}
