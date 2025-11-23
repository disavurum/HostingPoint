const db = require('../config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

class User {
  async init() {
    return this.createTable();
  }

  async createTable() {
    const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || process.env.USE_POSTGRES === '1';
    
    if (USE_POSTGRES) {
      // PostgreSQL table creation
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          plan_type VARCHAR(50) DEFAULT 'starter',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          is_admin INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `;
      
      try {
        await db.run(query);
        
        // Check if plan_type column exists
        try {
          const tableInfo = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'plan_type'
          `);
          
          if (tableInfo.length === 0) {
            await db.run("ALTER TABLE users ADD COLUMN plan_type VARCHAR(50) DEFAULT 'starter'");
          }
        } catch (err) {
          // Column might already exist
        }
      } catch (err) {
        throw err;
      }
    } else {
      // SQLite table creation (original code)
      let usersBackup = null;
      try {
        const tableInfo = await db.query("PRAGMA table_info(users)");
        const hasIdColumn = tableInfo.some(col => col.name === 'id');
        const idColumn = tableInfo.find(col => col.name === 'id');
        
        if (hasIdColumn && idColumn && idColumn.type === 'SERIAL') {
          console.log('Users table has incorrect id type (SERIAL), recreating...');
          usersBackup = await db.query("SELECT * FROM users");
          await db.run("DROP TABLE IF EXISTS users");
        }
      } catch (err) {
        console.log('Table check error (might not exist):', err.message);
      }
      
      const query = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          plan_type TEXT DEFAULT 'starter',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_admin INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1
        );
      `;
      try {
        await db.run(query);
        
        try {
          const tableInfo = await db.query("PRAGMA table_info(users)");
          const hasPlanType = tableInfo.some(col => col.name === 'plan_type');
          
          if (!hasPlanType) {
            await db.run("ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'starter'");
          }
        } catch (err) {
          // Table might not exist yet
        }
        
        if (usersBackup && usersBackup.length > 0) {
          console.log('Restoring user data...');
          for (const user of usersBackup) {
            await db.run(
              "INSERT INTO users (email, password, name, created_at, updated_at, is_admin, is_active, plan_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [user.email, user.password, user.name, user.created_at, user.updated_at, user.is_admin, user.is_active, user.plan_type || 'starter']
            );
          }
        }
      } catch (err) {
        throw err;
      }
    }
  }

  async create(email, password, name = null) {
    // Normalize email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists (case-insensitive)
    const existingUser = await this.findByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error('User already exists');
      error.code = 'SQLITE_CONSTRAINT';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const query = `
      INSERT INTO users (email, password, name) 
      VALUES (?, ?, ?)
    `;

    try {
      const result = await db.run(query, [normalizedEmail, hashedPassword, name]);
      return { id: result.id, email: normalizedEmail, name };
    } catch (err) {
      // Handle unique constraint violation
      if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint')) {
        const error = new Error('User already exists');
        error.code = 'SQLITE_CONSTRAINT';
        throw error;
      }
      throw err;
    }
  }

  async findByEmail(email) {
    // Normalize email (lowercase) for case-insensitive search
    const normalizedEmail = email.toLowerCase().trim();
    const query = `SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND is_active = 1`;
    try {
      const row = await db.get(query, [normalizedEmail]);
      return row;
    } catch (err) {
      throw err;
    }
  }

  async findById(id) {
    const query = `
      SELECT id, email, name, plan_type, created_at, is_admin 
      FROM users 
      WHERE id = ? AND is_active = 1
    `;
    try {
      const row = await db.get(query, [id]);
      return row;
    } catch (err) {
      throw err;
    }
  }

  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  async update(id, updates) {
    const { name, email, password } = updates;
    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];

    if (name) {
      query += `, name = ?`;
      values.push(name);
    }
    if (email) {
      query += `, email = ?`;
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      query += `, password = ?`;
      values.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    try {
      await db.run(query, values);
    } catch (err) {
      throw err;
    }
  }

  async updateLastLogin(userId) {
    const query = `UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    try {
      await db.run(query, [userId]);
    } catch (err) {
      throw err;
    }
  }

  async count() {
    const query = `SELECT COUNT(*) as count FROM users`;
    try {
      const row = await db.get(query);
      return row.count;
    } catch (err) {
      throw err;
    }
  }

  async findAll() {
    const query = `SELECT id, email, name, created_at, is_admin, is_active FROM users ORDER BY created_at DESC`;
    try {
      const rows = await db.query(query);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  close() {
    // DB handles closing
  }
}

module.exports = new User();
