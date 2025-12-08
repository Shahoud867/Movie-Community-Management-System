const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'movie_community'
  });
  
  const [movies] = await pool.query('SELECT movie_id, title, trailer_url FROM Movie WHERE trailer_url IS NOT NULL LIMIT 5');
  console.log('Movies with trailers:\n');
  movies.forEach(m => {
    console.log(`  ${m.title}`);
    console.log(`    Video ID: ${m.trailer_url}`);
    console.log(`    Embed URL: https://www.youtube.com/embed/${m.trailer_url}\n`);
  });
  
  await pool.end();
})();
