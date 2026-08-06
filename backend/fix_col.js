require('dotenv').config();
const {Client}=require('pg');
const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
c.connect()
  .then(()=>c.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_guest'"))
  .then(r=>{
    if(r.rows.length>0){
      console.log('is_guest column EXISTS');
      return c.end();
    }
    console.log('is_guest MISSING - adding...');
    return c.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest boolean DEFAULT false')
      .then(()=>{console.log('ADDED OK'); c.end()});
  })
  .catch(e=>{console.error('ERR:', e.message); c.end()});
