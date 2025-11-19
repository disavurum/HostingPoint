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
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );
    `;
    try {
      await db.query(query);
    } catch (err) {
      throw err;
    }
  }

  async create(email, password, name = null) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const query = `
      INSERT INTO users (email, password, name) 
      VALUES ($1, $2, $3) 
      RETURNING id, email, name
    `;
    
    try {
      const { rows } = await db.query(query, [email, hashedPassword, name]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1 AND is_active = 1`;
    try {
      const { rows } = await db.query(query, [email]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }

  async findById(id) {
    const query = `
      SELECT id, email, name, created_at, is_admin 
      FROM users 
      WHERE id = $1 AND is_active = 1
    `;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
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
    let paramCount = 1;

    if (name) {
      query += `, name = $${paramCount}`;
      values.push(name);
      paramCount++;
    }
    if (email) {
      query += `, email = $${paramCount}`;
      values.push(email);
      paramCount++;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
      query += `, password = $${paramCount}`;
      values.push(hashedPassword);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount}`;
    values.push(id);

    try {
      await db.query(query, values);
    } catch (err) {
      throw err;
    }
  }

  async updateLastLogin(userId) {
    const query = `UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`;
    try {
      await db.query(query, [userId]);
    } catch (err) {
      throw err;
    }
  }

  close() {
    // Pool handles closing
  }
}

module.exports = new User();
