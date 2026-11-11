const express = require('express');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const env = require('./config/env');
const pool = require('./config/db');
const {notFound,errorHandler}=require('./middleware/errors');
const authRoutes=require('./modules/auth/routes');
const profileRoutes=require('./modules/profiles/routes');
const catalogRoutes=require('./modules/catalog/routes');
const historyRoutes=require('./modules/history/routes');
const subscriptionRoutes=require('./modules/subscriptions/routes');

const app=express();
app.disable('x-powered-by');
if(env.TRUST_PROXY>0)app.set('trust proxy',env.TRUST_PROXY);
app.use(helmet({crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(cors({origin:env.CLIENT_ORIGIN,credentials:true}));
app.use(express.json({limit:'1mb'}));
const PgStore=connectPgSimple(session);
app.use(session({store:new PgStore({pool,tableName:'user_sessions',createTableIfMissing:true}),name:'streamify.sid',secret:env.SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:env.NODE_ENV==='production',maxAge:1000*60*60*24*7}}));

const authLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{error:{message:'Too many authentication attempts. Try again later.'}}});
app.get('/api/v1/health',(_req,res)=>res.json({data:{status:'ok',service:'streamify-api'}}));
app.use('/api/v1/auth',authLimiter,authRoutes);
app.use('/api/v1/profiles',profileRoutes);
app.use('/api/v1/catalog',catalogRoutes);
app.use('/api/v1/history',historyRoutes);
app.use('/api/v1/subscriptions',subscriptionRoutes);

if(env.NODE_ENV==='production'){
  const dist=path.resolve(__dirname,'../../frontend/dist');
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/,(_req,res)=>res.sendFile(path.join(dist,'index.html')));
}

app.use(notFound);
app.use(errorHandler);
module.exports=app;
