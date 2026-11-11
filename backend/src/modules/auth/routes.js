const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const pool = require('../../config/db');
const asyncHandler = require('../../utils/asyncHandler');
const { requireAuth } = require('../../middleware/auth');
const {registerSchema,loginSchema}=require('./validation');

function createRouter(database=pool){
const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const user = await client.query('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email,role', [input.email, passwordHash]);
    await client.query('INSERT INTO profiles(user_id,name) VALUES($1,$2)', [user.rows[0].id, input.name]);
    if (input.planId) {
      const plan = await client.query('SELECT id FROM subscription_plans WHERE id=$1 AND active=true', [input.planId]);
      if (!plan.rowCount) throw Object.assign(new Error('Choose an available plan.'), { status: 400 });
    }
    await client.query('INSERT INTO audit_logs(user_id,event_type) VALUES($1,$2)', [user.rows[0].id, 'account.registered']);
    await client.query('COMMIT');
    await new Promise((resolve,reject)=>req.session.regenerate((error)=>error?reject(error):resolve()));
    req.session.userId = user.rows[0].id;
    req.session.role = 'user';
    res.status(201).json({ data: { user: user.rows[0] } });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await database.query('SELECT id,email,password_hash,role FROM users WHERE email=$1', [input.email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) return res.status(401).json({ error: { message: 'Email or password is incorrect.' } });
  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ data: { user: { id: user.id, email: user.email, role: user.role } } });
}));

router.post('/logout', (req, res, next) => req.session.destroy((error) => {
  if (error) return next(error);
  res.clearCookie('streamify.sid');
  res.json({ data: { success: true } });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await database.query('SELECT id,email,role,created_at FROM users WHERE id=$1', [req.session.userId]);
  res.json({ data: { user: rows[0] } });
}));

return router;
}
module.exports=createRouter();
module.exports.createRouter=createRouter;
