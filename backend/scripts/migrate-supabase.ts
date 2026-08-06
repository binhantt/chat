import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';

async function main() {
  // Load .env
  const envPath = resolve(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx <= 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 15000,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const sqlPath = resolve(__dirname, '..', '..', 'migration.sql');
  const sql = readFileSync(sqlPath, 'utf8');

  console.log('Running migration...');
  await client.query(sql);

  await client.end();
  console.log('Migration completed successfully.');
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
