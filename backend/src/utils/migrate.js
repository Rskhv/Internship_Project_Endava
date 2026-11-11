const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    const migrationDir=path.resolve(__dirname,'../../../database/migrations');
    const files=(await fs.readdir(migrationDir)).filter((name)=>name.endsWith('.sql')).sort();
    for(const name of files){
      const {rowCount}=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
      if(rowCount)continue;
      const sql=await fs.readFile(path.join(migrationDir,name),'utf8');
      await client.query('BEGIN');
      try{await client.query(sql);await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);await client.query('COMMIT');console.log(`Applied ${name}.`);}
      catch(error){await client.query('ROLLBACK');throw error;}
    }
    console.log(`Database migrations complete (${files.length} found).`);
  } catch (error) {
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => { console.error(`Migration failed: ${error.message}`); process.exitCode = 1; });
