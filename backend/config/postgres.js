const { Pool } = require('pg');
const logger = require('../utils/logger');

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || 'postgres',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
};

// Get single row
const get = async (text, params) => {
  const result = await query(text, params);
  return result.rows[0] || null;
};

// Get all rows
const getAll = async (text, params) => {
  const result = await query(text, params);
  return result.rows || result;
};

// Run (INSERT, UPDATE, DELETE) - returns last inserted ID for INSERT
const run = async (text, params) => {
  // For INSERT, append RETURNING id to get the inserted ID
  let sql = text;
  if (text.trim().toUpperCase().startsWith('INSERT')) {
    // Check if RETURNING clause already exists
    if (!text.toUpperCase().includes('RETURNING')) {
      sql = text + ' RETURNING id';
    }
  }
  
  const result = await query(sql, params);
  return {
    id: result[0]?.id || result.rows?.[0]?.id || null,
    changes: result.length || result.rowCount || 0
  };
};

// Close pool
const close = async () => {
  await pool.end();
  logger.info('PostgreSQL pool closed');
};

module.exports = {
  query,
  get,
  getAll,
  run,
  close,
  pool
};

