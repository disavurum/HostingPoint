const sqlite3 = require('sqlite3').verbose();
// Database configuration for SQLite
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Could not connect to database', err);
  } else {
    logger.info('Connected to SQLite database');
  }
});

// Promisify query function
const query = (sql, params = []) => {
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
};

// Promisify run function (for INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
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
};

// Promisify get function (for single row)
const get = (sql, params = []) => {
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
};

module.exports = {
  query,
  run,
  get,
  db
};
