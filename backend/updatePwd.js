const bcrypt = require('bcrypt'); 
const { Pool } = require('pg'); 
require('dotenv').config(); 
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); 
async function run() { 
  const hash = await bcrypt.hash('admin123', 10); 
  await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hash, 'admin']); 
  console.log('Password updated successfully'); 
  process.exit(0); 
} 
run();
