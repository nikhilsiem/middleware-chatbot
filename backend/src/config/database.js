const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For production databases (Railway, Supabase, etc.), SSL is usually required
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create messages table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_id ON messages(user_id);
      CREATE INDEX IF NOT EXISTS idx_created_at ON messages(created_at);
    `);

    client.release();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    // Don't exit - allow app to run even if DB init fails (for development)
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  initializeDatabase,
  testConnection
};

