import {beforeEach,describe,expect,it,vi} from 'vitest';
import express from 'express';
import supertest from 'supertest';
import bcrypt from 'bcryptjs';

const pool={query:vi.fn(),connect:vi.fn(),end:vi.fn()};

process.env.NODE_ENV='test';
process.env.DATABASE_URL='postgresql://test:test@localhost:5432/streamify_test';
process.env.SESSION_SECRET='test-only-session-secret-with-at-least-32-characters';
process.env.CLIENT_ORIGIN='http://localhost:5173';

const [{default:authModule},{default:profileModule},{default:catalogModule},{default:historyModule},{default:subscriptionModule}]=await Promise.all([
  import('../src/modules/auth/routes.js'),import('../src/modules/profiles/routes.js'),import('../src/modules/catalog/routes.js'),import('../src/modules/history/routes.js'),import('../src/modules/subscriptions/routes.js')
]);
const {errorHandler}=await import('../src/middleware/errors.js');
const authRouter=authModule.createRouter(pool);const profileRouter=profileModule.createRouter(pool);const catalogRouter=catalogModule.createRouter(pool);const historyRouter=historyModule.createRouter(pool);const subscriptionRouter=subscriptionModule.createRouter(pool);

function makeApp(router,base,session={userId:'user-1',role:'user',activeProfileId:'profile-1'}){
  const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={...session,regenerate:callback=>callback(),destroy:callback=>callback()};next();});app.use(base,router);app.use(errorHandler);return app;
}
function mockQuery(handler){pool.query.mockImplementation(handler);}
function mockClient(handler){const client={query:vi.fn(handler),release:vi.fn()};pool.connect.mockResolvedValue(client);return client;}

beforeEach(()=>{pool.query.mockReset();pool.connect.mockReset();});

describe('auth routes',()=>{
  it('registers a normalized email and stores only a password hash',async()=>{
    const client=mockClient(async(sql,values)=>{
      if(sql.includes('INSERT INTO users'))return {rows:[{id:'1',email:values[0],role:'user'}]};
      return {rows:[],rowCount:1};
    });
    const response=await supertest(makeApp(authRouter,'/api/v1/auth')).post('/api/v1/auth/register').send({email:'  DEMO@EXAMPLE.COM ',password:'correct horse battery staple',name:'Demo'});
    expect(response.status).toBe(201);
    const insert=client.query.mock.calls.find(([sql])=>sql.includes('INSERT INTO users'));
    expect(insert[1][0]).toBe('demo@example.com');
    expect(insert[1][1]).not.toBe('correct horse battery staple');
    expect(await bcrypt.compare('correct horse battery staple',insert[1][1])).toBe(true);
  });

  it('rejects weak passwords and malformed registration input',async()=>{
    const response=await supertest(makeApp(authRouter,'/api/v1/auth')).post('/api/v1/auth/register').send({email:'not-an-email',password:'short',name:''});
    expect(response.status).toBe(400);
  });

  it('rejects an incorrect login password',async()=>{
    const hash=await bcrypt.hash('a-strong-correct-password',4);
    mockQuery(async()=>({rows:[{id:'1',email:'demo@example.com',password_hash:hash,role:'user'}],rowCount:1}));
    const response=await supertest(makeApp(authRouter,'/api/v1/auth',{userId:null,role:null})).post('/api/v1/auth/login').send({email:'demo@example.com',password:'incorrect'});
    expect(response.status).toBe(401);
    expect(response.body.error.message).toMatch(/incorrect/i);
  });

  it('starts a session after a correct login',async()=>{
    const hash=await bcrypt.hash('a-strong-correct-password',4);
    mockQuery(async()=>({rows:[{id:'1',email:'demo@example.com',password_hash:hash,role:'user'}],rowCount:1}));
    const response=await supertest(makeApp(authRouter,'/api/v1/auth',{userId:null,role:null})).post('/api/v1/auth/login').send({email:'demo@example.com',password:'a-strong-correct-password'});
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({id:'1',role:'user'});
  });

  it('requires a session for the current-user endpoint',async()=>{
    const response=await supertest(makeApp(authRouter,'/api/v1/auth',{userId:null,role:null})).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('returns the user bound to an authenticated session',async()=>{
    mockQuery(async(_sql,values)=>({rows:[{id:values[0],email:'demo@example.com',role:'user'}],rowCount:1}));
    const response=await supertest(makeApp(authRouter,'/api/v1/auth')).get('/api/v1/auth/me');
    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe('user-1');
  });
});

describe('profile ownership',()=>{
  it('lists profiles using the session user, not a client-supplied account id',async()=>{
    mockQuery(async(_sql,values)=>({rows:[{id:'profile-1',name:'Demo'}],rowCount:1}));
    const response=await supertest(makeApp(profileRouter,'/api/v1/profiles')).get('/api/v1/profiles');
    expect(response.status).toBe(200);
    expect(pool.query.mock.calls[0][1]).toEqual(['user-1']);
  });

  it('will not select a profile owned by another user',async()=>{
    mockQuery(async()=>({rows:[],rowCount:0}));
    const response=await supertest(makeApp(profileRouter,'/api/v1/profiles')).post('/api/v1/profiles/999/select');
    expect(response.status).toBe(404);
  });
});

describe('catalog and admin authorization',()=>{
  it('serves searchable catalog rows with profile maturity constraints',async()=>{
    mockQuery(async(sql)=>sql.includes('SELECT id,maturity_rating')?{rows:[{id:'profile-1',maturity_rating:'kids'}],rowCount:1}:{rows:[{id:'1',title:'Demo'}],rowCount:1});
    const response=await supertest(makeApp(catalogRouter,'/api/v1/catalog')).get('/api/v1/catalog?search=demo');
    expect(response.status).toBe(200);
    const listing=pool.query.mock.calls.find(([sql])=>sql.includes('ILIKE'));
    expect(listing[0]).toContain('ILIKE');
    expect(listing[0]).toContain("'TV-Y'");
    expect(listing[1]).toContain('%demo%');
  });

  it('blocks catalog admin routes for normal users',async()=>{
    const response=await supertest(makeApp(catalogRouter,'/api/v1/catalog')).get('/api/v1/catalog/admin/all');
    expect(response.status).toBe(403);
  });
});

describe('watch history and simulated subscriptions',()=>{
  it('prevents a user from writing progress for another user’s profile',async()=>{
    mockQuery(async()=>({rows:[],rowCount:0}));
    const response=await supertest(makeApp(historyRouter,'/api/v1/history')).put('/api/v1/history/other-profile/42/progress').send({progressPercentage:25});
    expect(response.status).toBe(404);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it('marks progress complete at the configured threshold',async()=>{
    mockQuery(async(sql)=>sql.startsWith('SELECT 1')?{rows:[{ '?column?':1}],rowCount:1}:{rows:[{id:'1',progress_percentage:100,completed:true}],rowCount:1});
    const response=await supertest(makeApp(historyRouter,'/api/v1/history')).put('/api/v1/history/profile-1/42/progress').send({progressPercentage:97});
    expect(response.status).toBe(200);
    expect(response.body.data.completed).toBe(true);
    expect(pool.query.mock.calls[1][1].slice(-2)).toEqual([100,true]);
  });

  it('returns continue-watching rows only for an owned profile',async()=>{
    mockQuery(async(sql)=>sql.startsWith('SELECT 1')?{rows:[{'?column?':1}],rowCount:1}:{rows:[{id:'42',title:'Demo',progress_percentage:22}],rowCount:1});
    const response=await supertest(makeApp(historyRouter,'/api/v1/history')).get('/api/v1/history/profile-1/continue');
    expect(response.status).toBe(200);
    expect(response.body.data[0].progress_percentage).toBe(22);
    expect(pool.query.mock.calls[1][1]).toEqual(['profile-1']);
  });

  it('rejects invalid playback progress',async()=>{
    mockQuery(async()=>({rows:[{ '?column?':1}],rowCount:1}));
    const response=await supertest(makeApp(historyRouter,'/api/v1/history')).put('/api/v1/history/profile-1/42/progress').send({progressPercentage:150});
    expect(response.status).toBe(400);
  });

  it('creates only a demo payment and activates a subscription after simulated success',async()=>{
    const client=mockClient(async(sql,values)=>{
      if(sql.includes('SELECT id,price,currency'))return {rows:[{id:2,price:'199.00',currency:'INR'}],rowCount:1};
      if(sql.includes('INSERT INTO user_subscriptions'))return {rows:[{id:'sub-1',plan_id:2,status:'active'}],rowCount:1};
      if(sql.includes('INSERT INTO payments'))return {rows:[{id:'pay-1',amount:'199.00',status:'succeeded',transaction_reference:values.at(-1)}],rowCount:1};
      return {rows:[],rowCount:1};
    });
    mockQuery(async()=>({rows:[{id:2,price:'199.00',currency:'INR'}],rowCount:1}));
    const response=await supertest(makeApp(subscriptionRouter,'/api/v1/subscriptions')).post('/api/v1/subscriptions/demo-checkout').send({planId:2,outcome:'success',paymentMethodLabel:'Demo wallet'});
    expect(response.status).toBe(201);
    expect(response.body.data.subscription.status).toBe('active');
    expect(response.body.data.payment.transaction_reference).toMatch(/^DEMO-/);
    expect(client.query.mock.calls.some(([sql])=>sql.includes('INSERT INTO payments'))).toBe(true);
  });

  it('records demo failure without activating a subscription',async()=>{
    const client=mockClient(async(sql,values)=>{
      if(sql.includes('SELECT id,price,currency'))return {rows:[{id:2,price:'199.00',currency:'INR'}],rowCount:1};
      if(sql.includes('INSERT INTO payments'))return {rows:[{id:'pay-2',status:'failed',transaction_reference:values.at(-1)}],rowCount:1};
      return {rows:[],rowCount:1};
    });
    mockQuery(async()=>({rows:[{id:2,price:'199.00',currency:'INR'}],rowCount:1}));
    const response=await supertest(makeApp(subscriptionRouter,'/api/v1/subscriptions')).post('/api/v1/subscriptions/demo-checkout').send({planId:2,outcome:'failure'});
    expect(response.status).toBe(200);
    expect(response.body.data.subscription).toBeNull();
    expect(response.body.data.payment.status).toBe('failed');
    expect(client.query.mock.calls.some(([sql])=>sql.includes('INSERT INTO user_subscriptions'))).toBe(false);
  });
});
