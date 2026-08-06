const { DataSource } = require('typeorm');
const fs = require('fs');

const envContent = fs.readFileSync('/home/chat/backend/.env', 'utf8');
const dbUrl = envContent.match(/DATABASE_URL=(.+)/)[1].trim();

const ds = new DataSource({
  type: 'postgres',
  url: dbUrl,
  ssl: { rejectUnauthorized: false },
});

ds.initialize()
  .then(() => {
    console.log('Connected to database');
    return ds.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "isGuest" boolean NOT NULL DEFAULT false');
  })
  .then(() => {
    console.log('Added isGuest column to users table');
    return ds.destroy();
  })
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
