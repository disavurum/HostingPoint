const db = require('../config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

class User {
  async init() {
    return this.createTable();
  }

  async createTable() {
    // Check if table exists and has correct structure
    let usersBackup = null;
    try {
      const tableInfo = await db.query("PRAGMA table_info(users)");
      const hasIdColumn = tableInfo.some(col => col.name === 'id');
      const idColumn = tableInfo.find(col => col.name === 'id');
      
      // If table exists but id column is SERIAL (wrong type), we need to recreate it
      if (hasIdColumn && idColumn && idColumn.type === 'SERIAL') {
        console.log('Users table has incorrect id type (SERIAL), recreating...');
        // Backup data
        usersBackup = await db.query("SELECT * FROM users");
        // Drop and recreate
        await db.run("DROP TABLE IF EXISTS users");
      }
    } catch (err) {
      // Table might not exist, that's okay
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
      
      // Check if plan_type column exists, if not add it
      try {
        const tableInfo = await db.query("PRAGMA table_info(users)");
        const hasPlanType = tableInfo.some(col => col.name === 'plan_type');
        
        if (!hasPlanType) {
          await db.run("ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'starter'");
        }
      } catch (err) {
        // Table might not exist yet, that's okay
      }
      
      // Restore data if we had to recreate
      if (usersBackup && usersBackup.length > 0) {
        console.log('Restoring user data...');
        for (const user of usersBackup) {
          // Skip id, let it auto-increment
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

  async create(email, password, name = null) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const query = `
      INSERT INTO users (email, password, name) 
      VALUES (?, ?, ?)
    `;

    try {
      const result = await db.run(query, [email, hashedPassword, name]);
      return { id: result.id, email, name };
    } catch (err) {
      throw err;
    }
  }

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ? AND is_active = 1`;
    try {
      const row = await db.get(query, [email]);
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
