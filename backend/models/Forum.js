const db = require('../config/db');

class Forum {
  async init() {
    return this.createTable();
  }

  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS forums (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        email VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'deploying',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_forums_user_id ON forums(user_id);
    `;
    try {
      await db.query(query);
    } catch (err) {
      throw err;
    }
  }

  async create(name, userId, email, domain) {
    const query = `
      INSERT INTO forums (name, user_id, email, domain, status) 
      VALUES (?, ?, ?, ?, 'deploying') 
    `;
    try {
      const result = await db.run(query, [name, userId, email, domain]);
      return { id: result.id, name, user_id: userId, email, domain, status: 'deploying' };
    } catch (err) {
      throw err;
    }
  }

  async findByUser(userId) {
    const query = `SELECT * FROM forums WHERE user_id = ? ORDER BY created_at DESC`;
    try {
      const rows = await db.query(query, [userId]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async findByName(name) {
    const query = `SELECT * FROM forums WHERE name = ?`;
    try {
      const row = await db.get(query, [name]);
      return row;
    } catch (err) {
      throw err;
    }
  }

  async findAll() {
    const query = `
      SELECT f.*, u.email as user_email, u.name as user_name 
      FROM forums f 
      LEFT JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
    `;
    try {
      const rows = await db.query(query);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  async count() {
    const query = `SELECT COUNT(*) as count FROM forums`;
    try {
      const row = await db.get(query);
      return row.count;
    } catch (err) {
      throw err;
    }
  }

  async updateStatus(name, status) {
    const query = `UPDATE forums SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?`;
    try {
      await db.run(query, [status, name]);
    } catch (err) {
      throw err;
    }
  }

  async delete(name) {
    const query = `DELETE FROM forums WHERE name = ?`;
    try {
      await db.run(query, [name]);
    } catch (err) {
      throw err;
    }
  }

  async checkOwnership(name, userId) {
    const query = `SELECT user_id FROM forums WHERE name = ?`;
    try {
      const row = await db.get(query, [name]);
      return row && row.user_id === userId;
    } catch (err) {
      throw err;
    }
  }

  close() {
    // Pool handles closing
  }
}

module.exports = new Forum();
