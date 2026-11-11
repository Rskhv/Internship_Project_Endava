const { Router } = require('express');
const pool = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const {requireActiveProfile,maturityFilter}=require('../../middleware/profile');

function createRouter(database=pool){
const router = Router();
router.use(requireAuth);
const listSql = `SELECT c.id,c.title,c.description,c.content_type,c.release_year,c.maturity_rating,c.duration,c.poster_url,c.backdrop_url,c.featured,
  COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL),'{}') AS genres
  FROM content c LEFT JOIN content_genres cg ON cg.content_id=c.id LEFT JOIN genres g ON g.id=cg.genre_id`;

router.get('/',requireActiveProfile(database),asyncHandler(async (req,res) => {
  const page = Math.max(1, Math.min(10000, Number.parseInt(req.query.page,10) || 1));
  const limit = Math.max(1, Math.min(40, Number.parseInt(req.query.limit,10) || 20));
  const type = ['movie','tv_show'].includes(req.query.type) ? req.query.type : null;
  const genre = typeof req.query.genre === 'string' && req.query.genre.trim() ? req.query.genre.trim().slice(0,100) : null;
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0,100) : '';
  const where=[]; const values=[];
  if(type){values.push(type);where.push(`c.content_type=$${values.length}`);}
  if(genre){values.push(genre);where.push(`EXISTS(SELECT 1 FROM content_genres x JOIN genres y ON y.id=x.genre_id WHERE x.content_id=c.id AND y.name=$${values.length})`);}
  if(search){values.push(`%${search.replace(/[\\%_]/g,'\\$&')}%`);where.push(`c.title ILIKE $${values.length} ESCAPE '\\'`);}
  where.push(maturityFilter(req.activeProfile));
  const filter = ` WHERE ${where.join(' AND ')}`;
  values.push(limit,(page-1)*limit);
  const {rows}=await database.query(`${listSql}${filter} GROUP BY c.id ORDER BY c.featured DESC,c.title LIMIT $${values.length-1} OFFSET $${values.length}`,values);
  res.json({data:rows,pagination:{page,limit}});
}));

router.get('/genres',asyncHandler(async (_req,res) => {
  const {rows}=await database.query('SELECT id,name FROM genres ORDER BY name');res.json({data:rows});
}));

router.get('/:id',requireActiveProfile(database),asyncHandler(async (req,res,next) => {
  if(req.params.id==='admin')return next();
  const {rows}=await database.query(`${listSql} WHERE c.id=$1 AND ${maturityFilter(req.activeProfile)} GROUP BY c.id`,[req.params.id]);
  if(!rows[0]) return res.status(404).json({error:{message:'Title not found.'}});
  const detail=rows[0];
  const [actors,directors,episodes]=await Promise.all([
    database.query('SELECT a.id,a.name FROM actors a JOIN content_actors ca ON ca.actor_id=a.id WHERE ca.content_id=$1 ORDER BY a.name',[detail.id]),
    database.query('SELECT d.id,d.name FROM directors d JOIN content_directors cd ON cd.director_id=d.id WHERE cd.content_id=$1 ORDER BY d.name',[detail.id]),
    database.query('SELECT id,season_number,episode_number,title,description,duration FROM episodes WHERE content_id=$1 ORDER BY season_number,episode_number',[detail.id])
  ]);
  res.json({data:{...detail,cast:actors.rows,directors:directors.rows,episodes:episodes.rows}});
}));

router.get('/featured/one',requireActiveProfile(database),asyncHandler(async (req,res)=>{
  const {rows}=await database.query(`${listSql} WHERE c.featured=true AND ${maturityFilter(req.activeProfile)} GROUP BY c.id ORDER BY c.id LIMIT 1`);
  if(!rows[0]) return res.json({data:null});res.json({data:rows[0]});
}));

router.get('/admin/all',requireAdmin,asyncHandler(async(req,res)=>{
  const page=Math.max(1,Number.parseInt(req.query.page,10)||1);const limit=Math.min(100,Math.max(1,Number.parseInt(req.query.limit,10)||40));
  const {rows}=await database.query('SELECT id,title,content_type,release_year,featured FROM content ORDER BY id DESC LIMIT $1 OFFSET $2',[limit,(page-1)*limit]);res.json({data:rows,pagination:{page,limit}});
}));

router.get('/admin/:id',requireAdmin,asyncHandler(async(req,res)=>{
  const {rows}=await database.query(`${listSql} WHERE c.id=$1 GROUP BY c.id`,[req.params.id]);
  if(!rows[0])return res.status(404).json({error:{message:'Title not found.'}});
  const detail=rows[0];
  const [actors,directors,episodes]=await Promise.all([
    database.query('SELECT a.id,a.name FROM actors a JOIN content_actors ca ON ca.actor_id=a.id WHERE ca.content_id=$1 ORDER BY a.name',[detail.id]),
    database.query('SELECT d.id,d.name FROM directors d JOIN content_directors cd ON cd.director_id=d.id WHERE cd.content_id=$1 ORDER BY d.name',[detail.id]),
    database.query('SELECT id,season_number,episode_number,title,description,duration FROM episodes WHERE content_id=$1 ORDER BY season_number,episode_number',[detail.id])
  ]);
  res.json({data:{...detail,cast:actors.rows,directors:directors.rows,episodes:episodes.rows}});
}));

router.post('/admin',requireAdmin,asyncHandler(async(req,res)=>{
  const {z}=require('zod');const input=z.object({title:z.string().trim().min(1).max(255),description:z.string().max(5000).default(''),contentType:z.enum(['movie','tv_show']),releaseYear:z.coerce.number().int().min(1800).max(2200).nullable().optional(),maturityRating:z.string().max(24).nullable().optional(),duration:z.coerce.number().int().positive().nullable().optional(),posterUrl:z.string().url().max(1000).nullable().optional(),backdropUrl:z.string().url().max(1000).nullable().optional(),featured:z.boolean().default(false),genres:z.array(z.string().trim().min(1).max(100)).max(20).default([]),cast:z.array(z.string().trim().min(1).max(255)).max(50).default([]),directors:z.array(z.string().trim().min(1).max(255)).max(20).default([])}).parse(req.body);
  const client=await database.connect();
  try{
    await client.query('BEGIN');
    const result=await client.query('INSERT INTO content(title,description,content_type,release_year,maturity_rating,duration,poster_url,backdrop_url,featured) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,title',[input.title,input.description,input.contentType,input.releaseYear||null,input.maturityRating||null,input.duration||null,input.posterUrl||null,input.backdropUrl||null,input.featured]);
    const id=result.rows[0].id;
    for(const name of input.genres){const g=await client.query('INSERT INTO genres(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id',[name]);await client.query('INSERT INTO content_genres(content_id,genre_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,g.rows[0].id]);}
    for(const name of input.cast){const a=await client.query('INSERT INTO actors(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id',[name]);await client.query('INSERT INTO content_actors(content_id,actor_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,a.rows[0].id]);}
    for(const name of input.directors){const d=await client.query('INSERT INTO directors(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id',[name]);await client.query('INSERT INTO content_directors(content_id,director_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,d.rows[0].id]);}
    await client.query('INSERT INTO audit_logs(user_id,event_type,entity_type,entity_id) VALUES($1,$2,$3,$4)',[req.session.userId,'catalog.created','content',String(id)]);
    await client.query('COMMIT');res.status(201).json({data:result.rows[0]});
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

router.patch('/admin/:id',requireAdmin,asyncHandler(async(req,res)=>{
  const {z}=require('zod');const input=z.object({title:z.string().trim().min(1).max(255).optional(),description:z.string().max(5000).optional(),contentType:z.enum(['movie','tv_show']).optional(),releaseYear:z.coerce.number().int().min(1800).max(2200).nullable().optional(),maturityRating:z.string().max(24).nullable().optional(),duration:z.coerce.number().int().positive().nullable().optional(),posterUrl:z.string().url().max(1000).nullable().optional(),backdropUrl:z.string().url().max(1000).nullable().optional(),featured:z.boolean().optional(),genres:z.array(z.string().trim().min(1).max(100)).max(20).optional(),cast:z.array(z.string().trim().min(1).max(255)).max(50).optional(),directors:z.array(z.string().trim().min(1).max(255)).max(20).optional()}).refine(v=>Object.keys(v).length>0).parse(req.body);
  const map={title:'title',description:'description',contentType:'content_type',releaseYear:'release_year',maturityRating:'maturity_rating',duration:'duration',posterUrl:'poster_url',backdropUrl:'backdrop_url',featured:'featured'};
  const client=await database.connect();try{await client.query('BEGIN');const sets=[];const values=[];for(const [key,col] of Object.entries(map)){if(input[key]!==undefined){values.push(input[key]);sets.push(`${col}=$${values.length}`);}}
    let rows;if(sets.length){values.push(req.params.id);rows=(await client.query(`UPDATE content SET ${sets.join(',')},updated_at=now() WHERE id=$${values.length} RETURNING id,title`,values)).rows;}else rows=(await client.query('SELECT id,title FROM content WHERE id=$1',[req.params.id])).rows;
    if(!rows[0]){await client.query('ROLLBACK');return res.status(404).json({error:{message:'Title not found.'}});}
    for(const [key,table,joinTable,joinColumn] of [['genres','genres','content_genres','genre_id'],['cast','actors','content_actors','actor_id'],['directors','directors','content_directors','director_id']])if(input[key]!==undefined){await client.query(`DELETE FROM ${joinTable} WHERE content_id=$1`,[req.params.id]);for(const name of input[key]){const entity=await client.query(`INSERT INTO ${table}(name) VALUES($1) ON CONFLICT(name) DO UPDATE SET name=EXCLUDED.name RETURNING id`,[name]);await client.query(`INSERT INTO ${joinTable}(content_id,${joinColumn}) VALUES($1,$2) ON CONFLICT DO NOTHING`,[req.params.id,entity.rows[0].id]);}}
    await client.query('COMMIT');res.json({data:rows[0]});
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

router.delete('/admin/:id',requireAdmin,asyncHandler(async(req,res)=>{const result=await database.query('DELETE FROM content WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.status(404).json({error:{message:'Title not found.'}});res.status(204).end();}));

router.post('/admin/genres',requireAdmin,asyncHandler(async(req,res)=>{const {z}=require('zod');const {name}=z.object({name:z.string().trim().min(1).max(100)}).parse(req.body);const {rows}=await database.query('INSERT INTO genres(name) VALUES($1) RETURNING id,name',[name]);res.status(201).json({data:rows[0]});}));

router.patch('/admin/genres/:id',requireAdmin,asyncHandler(async(req,res)=>{const {z}=require('zod');const {name}=z.object({name:z.string().trim().min(1).max(100)}).parse(req.body);const {rows}=await database.query('UPDATE genres SET name=$1 WHERE id=$2 RETURNING id,name',[name,req.params.id]);if(!rows[0])return res.status(404).json({error:{message:'Genre not found.'}});res.json({data:rows[0]});}));
router.delete('/admin/genres/:id',requireAdmin,asyncHandler(async(req,res)=>{const result=await database.query('DELETE FROM genres WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.status(404).json({error:{message:'Genre not found.'}});res.status(204).end();}));

router.post('/admin/:id/episodes',requireAdmin,asyncHandler(async(req,res)=>{const {z}=require('zod');const input=z.object({seasonNumber:z.coerce.number().int().positive(),episodeNumber:z.coerce.number().int().positive(),title:z.string().trim().min(1).max(255),description:z.string().max(5000).default(''),duration:z.coerce.number().int().positive().nullable().optional()}).parse(req.body);const {rows}=await database.query('INSERT INTO episodes(content_id,season_number,episode_number,title,description,duration) SELECT c.id,$2,$3,$4,$5,$6 FROM content c WHERE c.id=$1 RETURNING id,content_id,season_number,episode_number,title,description,duration',[req.params.id,input.seasonNumber,input.episodeNumber,input.title,input.description,input.duration||null]);if(!rows[0])return res.status(404).json({error:{message:'Title not found.'}});res.status(201).json({data:rows[0]});}));
router.delete('/admin/episodes/:id',requireAdmin,asyncHandler(async(req,res)=>{const result=await database.query('DELETE FROM episodes WHERE id=$1',[req.params.id]);if(!result.rowCount)return res.status(404).json({error:{message:'Episode not found.'}});res.status(204).end();}));

return router;
}
module.exports=createRouter();
module.exports.createRouter=createRouter;
