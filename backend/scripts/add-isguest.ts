import { DataSource } from 'typeorm';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await ds.initialize();
  console.log('Connected to database');

  await ds.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS "isGuest" boolean NOT NULL DEFAULT false
  `);
  console.log('Added isGuest column to users table');

  await ds.destroy();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
