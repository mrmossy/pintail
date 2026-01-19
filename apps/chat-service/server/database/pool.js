const { Pool } = require('pg');

// Database connection
const useSsl =
  process.env.NODE_ENV === 'production' || process.env.POSTGRES_SSL === 'true';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  ssl: useSsl ? { rejectUnauthorized: false, require: true } : false,
});

// Initialize database table
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255),
        user_message TEXT,
        assistant_response TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add index for faster session lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_session_id
      ON conversations(session_id)
    `);

    console.log('Database initialized');
  } catch (error) {
    console.error('Database init error:', error.message);
  }
}

module.exports = { pool, initDb };
