const pool=require('../config/db');
function requireActiveProfile(database=pool){
  return async(req,res,next)=>{
    if(!req.session.activeProfileId)return res.status(409).json({error:{message:'Choose a profile first.'}});
    try{
      const {rows}=await database.query('SELECT id,maturity_rating FROM profiles WHERE id=$1 AND user_id=$2',[req.session.activeProfileId,req.session.userId]);
      if(!rows[0]){delete req.session.activeProfileId;return res.status(404).json({error:{message:'Profile not found.'}});}
      req.activeProfile=rows[0];next();
    }catch(error){next(error);}
  };
}
function maturityFilter(profile){
  if(profile?.maturity_rating==='kids')return "UPPER(COALESCE(c.maturity_rating,'')) IN ('G','TV-Y','TV-Y7','TV-Y7-FV','TV-G','PG')";
  if(profile?.maturity_rating==='teen')return "UPPER(COALESCE(c.maturity_rating,'')) NOT IN ('TV-MA','R','NC-17','X')";
  return 'TRUE';
}
module.exports={requireActiveProfile,maturityFilter};
