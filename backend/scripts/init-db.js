require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'movie-community',
} = process.env;

async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  } finally {
    await conn.end();
  }
}

async function importSampleData() {
  const samplePath = path.resolve(__dirname, '../db/sample_data.sql');
  if (!fs.existsSync(samplePath)) {
    console.log('No sample_data.sql found; skipping import.');
    return;
  }
  let sql = fs.readFileSync(samplePath, 'utf8');
  // Strip DROP/CREATE/USE statements to load into the configured DB
  sql = sql
    .split(/\r?\n/)
    .filter((line) => !/^\s*(DROP\s+DATABASE|CREATE\s+DATABASE|USE)\b/i.test(line))
    .join('\n');
  if (!sql.trim()) {
    console.log('sample_data.sql is empty; skipping import.');
    return;
  }
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log('Sample data import: OK');
  } finally {
    await conn.end();
  }
}

(async () => {
  try {
    await ensureDatabase();
    console.log(`Database ensured: ${DB_NAME}`);
    await importSampleData();
    process.exit(0);
  } catch (e) {
    console.error('DB init failed:', e.message || e);
    process.exit(1);
  }
})();
