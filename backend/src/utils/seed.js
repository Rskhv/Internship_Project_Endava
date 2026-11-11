const fs=require('node:fs/promises');
const path=require('node:path');
const bcrypt=require('bcryptjs');
const pool=require('../config/db');
const env=require('../config/env');

function parseCsv(text){
  const rows=[];let row=[];let value='';let quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted&&c==='"'&&text[i+1]==='"'){value+='"';i++;}
    else if(c==='"'){quoted=!quoted;}
    else if(c===','&&!quoted){row.push(value);value='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value='';}
    else value+=c;
  }
  if(value.length||row.length){row.push(value);rows.push(row);}
  const headers=rows.shift()||[];
  return rows.filter((r)=>r.length===headers.length).map((r)=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));
}

async function insertMany(client,table,columns,rows,conflict=''){
  const width=columns.length;const chunkSize=Math.floor(60000/width);
  for(let start=0;start<rows.length;start+=chunkSize){
    const chunk=rows.slice(start,start+chunkSize);const values=[];const tuples=chunk.map((row)=>`(${row.map((v)=>{values.push(v);return `$${values.length}`;}).join(',')})`);
    await client.query(`INSERT INTO ${table}(${columns.join(',')}) VALUES ${tuples.join(',')} ${conflict}`,values);
  }
}
function list(value){return value?value.split(',').map((x)=>x.trim()).filter(Boolean):[];}

async function seed(){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    await insertMany(client,'subscription_plans',['name','description','price','currency','resolution','max_profiles'],[
      ['Mobile','One screen for mobile viewing',149,'INR','480p',1],['Basic','A simple personal plan',199,'INR','720p',1],['Standard','Full HD for two profiles',499,'INR','1080p',2],['Premium','Best available demo resolution for families',649,'INR','4K',4]
    ],'ON CONFLICT(name) DO NOTHING');
    const csvPath=path.resolve(__dirname,'../../../data/raw/netflix_titles.csv');
    let titles=[];
    try{titles=parseCsv(await fs.readFile(csvPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
    if(titles.length){
      const contentRows=titles.map((x)=>[x.show_id||null,x.title||'Untitled',x.description||'',x.type==='Movie'?'movie':'tv_show',Number(x.release_year)||null,x.rating||null,x.type==='Movie'?(parseInt(x.duration,10)||null):null]);
      await insertMany(client,'content',['source_key','title','description','content_type','release_year','maturity_rating','duration'],contentRows,'ON CONFLICT(source_key) DO NOTHING');
      const contentResult=await client.query('SELECT id,source_key FROM content WHERE source_key IS NOT NULL');const contentIds=new Map(contentResult.rows.map((x)=>[x.source_key,x.id]));
      const genreNames=new Set(),actorNames=new Set(),directorNames=new Set();
      for(const x of titles){list(x.listed_in).forEach((v)=>genreNames.add(v));list(x.cast).forEach((v)=>actorNames.add(v));list(x.director).forEach((v)=>directorNames.add(v));}
      await insertMany(client,'genres',['name'],[...genreNames].map((n)=>[n]),'ON CONFLICT(name) DO NOTHING');
      await insertMany(client,'actors',['name'],[...actorNames].map((n)=>[n]),'ON CONFLICT(name) DO NOTHING');
      await insertMany(client,'directors',['name'],[...directorNames].map((n)=>[n]),'ON CONFLICT(name) DO NOTHING');
      const [genres,actors,directors]=await Promise.all([client.query('SELECT id,name FROM genres'),client.query('SELECT id,name FROM actors'),client.query('SELECT id,name FROM directors')]);
      const genreIds=new Map(genres.rows.map((x)=>[x.name,x.id]));const actorIds=new Map(actors.rows.map((x)=>[x.name,x.id]));const directorIds=new Map(directors.rows.map((x)=>[x.name,x.id]));
      const contentGenres=[],contentActors=[],contentDirectors=[];
      for(const x of titles){const id=contentIds.get(x.show_id);if(!id)continue;for(const name of list(x.listed_in)){const gid=genreIds.get(name);if(gid)contentGenres.push([id,gid]);}for(const name of list(x.cast)){const aid=actorIds.get(name);if(aid)contentActors.push([id,aid]);}for(const name of list(x.director)){const did=directorIds.get(name);if(did)contentDirectors.push([id,did]);}}
      await insertMany(client,'content_genres',['content_id','genre_id'],contentGenres,'ON CONFLICT DO NOTHING');
      await insertMany(client,'content_actors',['content_id','actor_id'],contentActors,'ON CONFLICT DO NOTHING');
      await insertMany(client,'content_directors',['content_id','director_id'],contentDirectors,'ON CONFLICT DO NOTHING');
      console.log(`Imported ${titles.length} catalog rows from ${path.relative(process.cwd(),csvPath)}.`);
    }else{
      await client.query(`INSERT INTO content(source_key,title,description,content_type,release_year,maturity_rating,duration,featured) VALUES
        ('demo-lighthouse','The Last Lighthouse','A small coastal town unravels a mystery in this simulated featured title.','movie',2024,'PG',112,true),
        ('demo-orbit','Orbit Station','A crew works together through a year aboard an orbital research station.','tv_show',2023,'TV-14',45,false),
        ('demo-kitchen','Sunday Kitchen','Friends reconnect through food, music, and family stories.','movie',2022,'PG',98,false)
        ON CONFLICT(source_key) DO NOTHING`);
      console.log('Catalog CSV not found; inserted three demo titles.');
    }
    if(env.ADMIN_EMAIL&&env.ADMIN_PASSWORD){
      const passwordHash=await bcrypt.hash(env.ADMIN_PASSWORD,12);
      await client.query("INSERT INTO users(email,password_hash,role) VALUES($1,$2,'admin') ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='admin'",[env.ADMIN_EMAIL.toLowerCase(),passwordHash]);
    }
    await client.query('COMMIT');console.log('Database seed complete.');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();await pool.end();}
}
seed().catch((error)=>{console.error(`Seed failed: ${error.message}`);process.exitCode=1;});
