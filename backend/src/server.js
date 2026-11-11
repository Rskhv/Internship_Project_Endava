const app=require('./app');
const env=require('./config/env');
const pool=require('./config/db');

const server=app.listen(env.PORT,()=>console.log(`Streamify API listening on port ${env.PORT}`));
async function shutdown(){server.close(async()=>{await pool.end();process.exit(0);});}
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
