const sqlite3 = require('sqlite3').verbose();
// Database configuration - supports both SQLite and PostgreSQL
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.USE_POSTGRES === '1';
const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Use PostgreSQL if configured, otherwise SQLite
let db;
let postgresDb = null;
let usePostgres = false;
let postgresTested = false;

if (USE_POSTGRES) {
  try {
    postgresDb = require('./postgres');
    logger.info('PostgreSQL module loaded');
  } catch (error) {
    logger.error('Failed to load PostgreSQL config, falling back to SQLite:', error);
    postgresDb = null;
  }
}

// Always initialize SQLite as fallback
db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Could not connect to SQLite database', err);
  }
});

// Test PostgreSQL connection (async)
async function testPostgresConnection() {
  if (!USE_POSTGRES || !postgresDb || postgresTested) {
    return;
  }
  
  postgresTested = true;
  try {
    const isConnected = await postgresDb.testConnection();
    if (isConnected) {
      usePostgres = true;
      logger.info('Using PostgreSQL database');
    } else {
      logger.warn('PostgreSQL connection failed, falling back to SQLite');
      usePostgres = false;
      if (!db) {
        db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            logger.error('Could not connect to SQLite database', err);
          } else {
            logger.info('Connected to SQLite database (fallback)');
          }
        });
      }
    }
  } catch (error) {
    logger.error('PostgreSQL connection test error, falling back to SQLite:', error.message);
    usePostgres = false;
    if (!db) {
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Could not connect to SQLite database', err);
        } else {
          logger.info('Connected to SQLite database (fallback)');
        }
      });
    }
  }
}

// testPostgresConnection will be exported in module.exports below

// Query function - supports both SQLite and PostgreSQL
const query = async (sql, params = []) => {
  if (usePostgres && postgresDb) {
    try {
      // Convert SQLite syntax to PostgreSQL if needed
      const pgSql = convertSqliteToPostgres(sql, params);
      const result = await postgresDb.getAll(pgSql, params);
      return result;
    } catch (error) {
      // If PostgreSQL query fails, fall back to SQLite
      logger.warn('PostgreSQL query failed, falling back to SQLite:', error.message);
      usePostgres = false;
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            logger.error('Database query error', { sql, error: err.message });
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Database query error', { sql, error: err.message });
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

// Run function (for INSERT, UPDATE, DELETE)
const run = async (sql, params = []) => {
  if (usePostgres && postgresDb) {
    try {
      // Convert SQLite syntax to PostgreSQL
      const pgSql = convertSqliteToPostgres(sql, params);
      const result = await postgresDb.run(pgSql, params);
      return result;
    } catch (error) {
      // If PostgreSQL query fails, fall back to SQLite
      logger.warn('PostgreSQL run failed, falling back to SQLite:', error.message);
      usePostgres = false;
      return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) {
            logger.error('Database run error', { sql, error: err.message });
            reject(err);
          } else {
            resolve({ id: this.lastID, changes: this.changes });
          }
        });
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          logger.error('Database run error', { sql, error: err.message });
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }
};

// Get function (for single row)
const get = async (sql, params = []) => {
  if (usePostgres && postgresDb) {
    try {
      const pgSql = convertSqliteToPostgres(sql, params);
      const result = await postgresDb.get(pgSql, params);
      return result;
    } catch (error) {
      // If PostgreSQL query fails, fall back to SQLite
      logger.warn('PostgreSQL get failed, falling back to SQLite:', error.message);
      usePostgres = false;
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) {
            logger.error('Database get error', { sql, error: err.message });
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    }
  } else {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          logger.error('Database get error', { sql, error: err.message });
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
};

// Convert SQLite syntax to PostgreSQL
function convertSqliteToPostgres(sql, params = []) {
  let pgSql = sql;
  
  // Replace SQLite-specific syntax
  pgSql = pgSql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
  pgSql = pgSql.replace(/AUTOINCREMENT/gi, '');
  pgSql = pgSql.replace(/INTEGER PRIMARY KEY/gi, 'SERIAL PRIMARY KEY');
  pgSql = pgSql.replace(/TEXT/gi, 'VARCHAR(255)');
  pgSql = pgSql.replace(/PRAGMA table_info\(([^)]+)\)/gi, 
    "SELECT column_name as name, data_type as type FROM information_schema.columns WHERE table_name = $1");
  pgSql = pgSql.replace(/CURRENT_TIMESTAMP/gi, 'NOW()');
  
  // Count ? placeholders first
  const placeholderCount = (sql.match(/\?/g) || []).length;
  
  // Replace ? placeholders with $1, $2, etc. for PostgreSQL
  let paramIndex = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
  
  return pgSql;
}

module.exports = {
  query,
  run,
  get,
  db,
  testPostgresConnection
};
