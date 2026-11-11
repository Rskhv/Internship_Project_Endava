const { Router } = require('express');
const { z } = require('zod');
const pool = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const {normalizeProgress}=require('../../utils/playback');
const { requireAuth } = require('../../middleware/auth');
function createRouter(database=pool){
const router=Router();router.use(requireAuth);
async function ownedProfile(profileId,userId){const {rowCount}=await database.query('SELECT 1 FROM profiles WHERE id=$1 AND user_id=$2',[profileId,userId]);return rowCount>0;}

router.get('/:profileId',asyncHandler(async(req,res)=>{
  if(!await ownedProfile(req.params.profileId,req.session.userId))return res.status(404).json({error:{message:'Profile not found.'}});
  const {rows}=await database.query(`SELECT h.id,h.progress_percentage,h.last_watched_at,h.completed,c.id AS content_id,c.title,c.content_type,c.release_year,c.poster_url
    FROM watch_history h JOIN content c ON c.id=h.content_id WHERE h.profile_id=$1 ORDER BY h.last_watched_at DESC LIMIT 100`,[req.params.profileId]);res.json({data:rows});
}));

router.get('/:profileId/continue',asyncHandler(async(req,res)=>{
  if(!await ownedProfile(req.params.profileId,req.session.userId))return res.status(404).json({error:{message:'Profile not found.'}});
  const {rows}=await database.query(`SELECT c.id,c.title,c.content_type,c.release_year,c.poster_url,h.progress_percentage,h.last_watched_at FROM watch_history h JOIN content c ON c.id=h.content_id WHERE h.profile_id=$1 AND h.completed=false AND h.progress_percentage>0 ORDER BY h.last_watched_at DESC LIMIT 20`,[req.params.profileId]);res.json({data:rows});
}));

router.put('/:profileId/:contentId/progress',asyncHandler(async(req,res)=>{
  if(!await ownedProfile(req.params.profileId,req.session.userId))return res.status(404).json({error:{message:'Profile not found.'}});
  const {progressPercentage}=z.object({progressPercentage:z.coerce.number().min(0).max(100)}).parse(req.body);
  const normalized=normalizeProgress(progressPercentage);
  const {rows}=await database.query(`INSERT INTO watch_history(profile_id,content_id,progress_percentage,completed) SELECT $1,c.id,$3,$4 FROM content c WHERE c.id=$2 ON CONFLICT(profile_id,content_id) DO UPDATE SET progress_percentage=EXCLUDED.progress_percentage,completed=EXCLUDED.completed,last_watched_at=now() RETURNING id,profile_id,content_id,progress_percentage,completed,last_watched_at`,[req.params.profileId,req.params.contentId,normalized.progressPercentage,normalized.completed]);
  if(!rows[0])return res.status(404).json({error:{message:'Title not found.'}});res.json({data:rows[0]});
}));

router.delete('/:profileId/:contentId',asyncHandler(async(req,res)=>{
  if(!await ownedProfile(req.params.profileId,req.session.userId))return res.status(404).json({error:{message:'Profile not found.'}});
  await database.query('DELETE FROM watch_history WHERE profile_id=$1 AND content_id=$2',[req.params.profileId,req.params.contentId]);res.status(204).end();
}));
return router;
}
module.exports=createRouter();
module.exports.createRouter=createRouter;
