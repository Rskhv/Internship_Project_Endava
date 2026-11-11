const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
});

pool.on('error', (error) => console.error('Unexpected PostgreSQL pool error:', error.message));

module.exports = pool;
