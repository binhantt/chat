const { DataSource } = require('typeorm');
const fs = require('fs');

const url = fs.readFileSync('/home/chat/backend/.env', 'utf8').match(/DATABASE_URL=(.+)/)[1].trim();

const ds = new DataSource({
  type: 'postgres',
  url,
  ssl: { rejectUnauthorized: false },
});

ds.initialize()
  .then(() => ds.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"))
  .then(r => {
    console.log('User columns:', r.map(c => c.column_name).join(', '));
    return ds.destroy();
  })
  .catch(e => { console.error(e.message); process.exit(1); });
