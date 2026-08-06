require('dotenv').config();
const {Client}=require('pg');
const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
c.connect()
  .then(()=>c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_guest'"))
  .then(r=>{console.log('is_guest exists:', r.rows.length > 0); c.end()})
  .catch(e=>{console.error('ERR:', e.message); c.end()});
