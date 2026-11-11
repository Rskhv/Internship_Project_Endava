const { Router } = require('express');
const { z } = require('zod');
const pool = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { requireAuth } = require('../../middleware/auth');

function createRouter(database=pool){
const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await database.query('SELECT id,name,avatar,language,maturity_rating,created_at FROM profiles WHERE user_id=$1 ORDER BY id', [req.session.userId]);
  res.json({ data: rows });
}));

router.post('/:id/select',asyncHandler(async(req,res)=>{
  const {rows}=await database.query('SELECT id,name,maturity_rating FROM profiles WHERE id=$1 AND user_id=$2',[req.params.id,req.session.userId]);
  if(!rows[0])return res.status(404).json({error:{message:'Profile not found.'}});
  req.session.activeProfileId=rows[0].id;res.json({data:rows[0]});
}));

router.post('/', asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(1).max(60), language: z.string().trim().min(1).max(32).default('English'), maturityRating: z.enum(['kids','teen','adult']).default('adult'), avatar: z.string().url().max(500).optional() }).parse(req.body);
  const client=await database.connect();try{
    await client.query('BEGIN');
    await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[req.session.userId]);
    const {rows:limits}=await client.query(`SELECT COALESCE((SELECT sp.max_profiles FROM subscription_plans sp JOIN user_subscriptions us ON us.plan_id=sp.id WHERE us.user_id=$1 AND us.status='active' AND (us.expires_at IS NULL OR us.expires_at>now()) ORDER BY us.created_at DESC LIMIT 1),4) AS max_profiles,(SELECT COUNT(*)::int FROM profiles WHERE user_id=$1) AS current_count`,[req.session.userId]);
    const maxProfiles=limits[0]?.max_profiles||4;const currentCount=Number(limits[0]?.current_count||0);
    if(currentCount>=maxProfiles){await client.query('ROLLBACK');return res.status(409).json({error:{message:`Your demo plan allows ${maxProfiles} profiles.`}});}
    const { rows } = await client.query('INSERT INTO profiles(user_id,name,language,maturity_rating,avatar) VALUES($1,$2,$3,$4,$5) RETURNING id,name,avatar,language,maturity_rating', [req.session.userId,input.name,input.language,input.maturityRating,input.avatar || null]);
    await client.query('COMMIT');res.status(201).json({ data: rows[0] });
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const input = z.object({ name: z.string().trim().min(1).max(60).optional(), language: z.string().trim().min(1).max(32).optional(), maturityRating: z.enum(['kids','teen','adult']).optional(), avatar: z.string().url().max(500).nullable().optional() }).refine((value) => Object.keys(value).length > 0).parse(req.body);
  const { name, language, maturityRating, avatar } = input;
  const { rows } = await database.query(`UPDATE profiles SET name=COALESCE($1,name), language=COALESCE($2,language), maturity_rating=COALESCE($3,maturity_rating), avatar=CASE WHEN $4::boolean THEN $5 ELSE avatar END WHERE id=$6 AND user_id=$7 RETURNING id,name,avatar,language,maturity_rating`, [name || null,language || null,maturityRating || null,avatar !== undefined,avatar ?? null,req.params.id,req.session.userId]);
  if (!rows[0]) return res.status(404).json({ error: { message: 'Profile not found.' } });
  res.json({ data: rows[0] });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await database.query('DELETE FROM profiles WHERE id=$1 AND user_id=$2', [req.params.id, req.session.userId]);
  if (!result.rowCount) return res.status(404).json({ error: { message: 'Profile not found.' } });
  res.status(204).end();
}));

return router;
}
module.exports=createRouter();
module.exports.createRouter=createRouter;
