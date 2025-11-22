const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

console.log('Testing connection to:', process.env.DB_HOST);

pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL!');
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });


