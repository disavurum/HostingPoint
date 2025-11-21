const db = require('../config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

class User {
  async init() {
    return this.createTable();
  }

  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );
    `;
    try {
      await db.run(query);
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
      SELECT id, email, name, created_at, is_admin 
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

  close() {
    // DB handles closing
  }
}

module.exports = new User();
