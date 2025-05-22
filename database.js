const { Pool } = require('pg');

// Create a connection pool to the database
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the database connection
pool.on('connect', () => {
    console.log('📊 Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

module.exports = pool;