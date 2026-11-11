const {Router}=require('express');
const {z}=require('zod');
const {randomUUID}=require('node:crypto');
const pool=require('../../config/db');
const asyncHandler=require('../../utils/asyncHandler');
const {requireAuth,requireAdmin}=require('../../middleware/auth');
function createRouter(database=pool){
const router=Router();
router.get('/plans',asyncHandler(async(_req,res)=>{const {rows}=await database.query('SELECT id,name,description,price,currency,resolution,max_profiles FROM subscription_plans WHERE active=true ORDER BY price');res.json({data:rows});}));
router.use(requireAuth);
router.get('/current',asyncHandler(async(req,res)=>{const {rows}=await database.query(`SELECT s.id,s.status,s.starts_at,s.expires_at,p.id AS plan_id,p.name,p.price,p.currency,p.resolution,p.max_profiles FROM user_subscriptions s JOIN subscription_plans p ON p.id=s.plan_id WHERE s.user_id=$1 AND s.status='active' AND (s.expires_at IS NULL OR s.expires_at>now()) ORDER BY s.created_at DESC LIMIT 1`,[req.session.userId]);res.json({data:rows[0]||null});}));
router.get('/payments',asyncHandler(async(req,res)=>{const {rows}=await database.query('SELECT id,amount,currency,payment_method_label,status,transaction_reference,created_at FROM payments WHERE user_id=$1 ORDER BY created_at DESC',[req.session.userId]);res.json({data:rows});}));
router.post('/demo-checkout',asyncHandler(async(req,res)=>{
  const {planId,outcome,paymentMethodLabel}=z.object({planId:z.coerce.number().int().positive(),outcome:z.enum(['success','failure']).default('success'),paymentMethodLabel:z.enum(['Demo wallet','Simulated bank label','Demo voucher']).default('Demo wallet')}).parse(req.body);
  const plan=(await database.query('SELECT id,price,currency,max_profiles FROM subscription_plans WHERE id=$1 AND active=true',[planId])).rows[0];if(!plan)return res.status(404).json({error:{message:'Plan not found.'}});
  const profileCount=Number((await database.query('SELECT COUNT(*)::int AS count FROM profiles WHERE user_id=$1',[req.session.userId])).rows[0]?.count||0);
  if(profileCount>plan.max_profiles)return res.status(409).json({error:{message:`This plan supports ${plan.max_profiles} profile(s). Remove extra profiles before choosing it.`}});
  const client=await database.connect();try{await client.query('BEGIN');let payment;let subscription=null;
    if(outcome==='success'){
      const prior=await client.query("UPDATE user_subscriptions SET status='cancelled' WHERE user_id=$1 AND status='active'",[req.session.userId]);void prior;
      const sub=await client.query("INSERT INTO user_subscriptions(user_id,plan_id,status,expires_at) VALUES($1,$2,'active',now()+interval '30 days') RETURNING id,plan_id,status,starts_at,expires_at",[req.session.userId,planId]);subscription=sub.rows[0];
      payment=(await client.query("INSERT INTO payments(user_id,subscription_id,amount,currency,payment_method_label,status,transaction_reference) VALUES($1,$2,$3,$4,$5,'succeeded',$6) RETURNING id,amount,currency,payment_method_label,status,transaction_reference,created_at",[req.session.userId,subscription.id,plan.price,plan.currency,paymentMethodLabel,`DEMO-${randomUUID()}`])).rows[0];
    }else{
      payment=(await client.query("INSERT INTO payments(user_id,amount,currency,payment_method_label,status,transaction_reference) VALUES($1,$2,$3,$4,'failed',$5) RETURNING id,amount,currency,payment_method_label,status,transaction_reference,created_at",[req.session.userId,plan.price,plan.currency,paymentMethodLabel,`DEMO-${randomUUID()}`])).rows[0];
    }
    await client.query('INSERT INTO audit_logs(user_id,event_type,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)',[req.session.userId,`payment.demo.${outcome}`,'payment',String(payment.id),JSON.stringify({plan_id:plan.id})]);
    await client.query('COMMIT');res.status(outcome==='success'?201:200).json({data:{payment,subscription},message:outcome==='success'?'Demo payment succeeded. No money was charged.':'Demo payment failed. No money was charged.'});
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}));
router.get('/admin/users',requireAdmin,asyncHandler(async(req,res)=>{const page=Math.max(1,Number.parseInt(req.query.page,10)||1);const {rows}=await database.query('SELECT id,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 40 OFFSET $1',[(page-1)*40]);res.json({data:rows,pagination:{page,limit:40}});}));
router.get('/admin/subscriptions',requireAdmin,asyncHandler(async(_req,res)=>{const {rows}=await database.query('SELECT s.id,s.status,s.starts_at,s.expires_at,u.email,p.name AS plan_name FROM user_subscriptions s JOIN users u ON u.id=s.user_id JOIN subscription_plans p ON p.id=s.plan_id ORDER BY s.created_at DESC LIMIT 200');res.json({data:rows});}));
router.get('/admin/payments',requireAdmin,asyncHandler(async(_req,res)=>{const {rows}=await database.query('SELECT p.id,p.amount,p.currency,p.status,p.payment_method_label,p.transaction_reference,p.created_at,u.email FROM payments p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 200');res.json({data:rows});}));
return router;
}
module.exports=createRouter();
module.exports.createRouter=createRouter;
