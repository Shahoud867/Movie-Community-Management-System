/**
 * Add trailer_url column and update movies with YouTube trailer IDs
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addTrailers() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'movie_community',
    waitForConnections: true,
    connectionLimit: 10
  });

  try {
    console.log('Adding trailer_url column to Movie table...\n');

    // Check if column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'Movie' 
      AND COLUMN_NAME = 'trailer_url'
    `);

    if (columns.length === 0) {
      // Add column
      await pool.query(`
        ALTER TABLE Movie 
        ADD COLUMN trailer_url VARCHAR(255) DEFAULT NULL 
        COMMENT 'YouTube video ID for movie trailer'
      `);
      console.log('✓ Column added successfully\n');
    } else {
      console.log('✓ Column already exists\n');
    }

    // Update movies with trailer URLs
    const trailers = [
      { title: 'Inception', url: 'YoHD9XEInc0' },
      { title: 'The Dark Knight', url: 'EXeTwQWrcwY' },
      { title: 'La La Land', url: '0pdqf4P9MB8' },
      { title: 'Parasite', url: '5xH0HfJHsaY' },
      { title: 'El Secreto de Sus Ojos', url: 'OB1JrYCVJTg' },
      { title: 'Baran', url: 'T5UGItdsqUI' },
      { title: 'Khuda Kay Liye', url: 'EX65wpFll9o' },
      { title: 'Waar', url: '6Gc45eyvSL4' },
      { title: 'A Separation', url: 'VgPG6FdlKcA' },
      { title: "Pan's Labyrinth", url: 'jVZRnnVSQ8k' },
      { title: 'Jawani Phir Nahi Ani', url: 'tYZAG0FMmKY' },
      { title: 'The Revenant', url: 'LoebZZ8K5N0' },
      { title: 'About Elly', url: 'MdqMICWhxuA' }
    ];

    console.log('Updating movies with trailer URLs...\n');
    
    for (const trailer of trailers) {
      const [result] = await pool.query(
        'UPDATE Movie SET trailer_url = ? WHERE title = ?',
        [trailer.url, trailer.title]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ ${trailer.title}: ${trailer.url}`);
      } else {
        console.log(`⚠ ${trailer.title}: Movie not found`);
      }
    }

    // Verify
    console.log('\n' + '='.repeat(60));
    console.log('Verification:\n');
    const [movies] = await pool.query(
      'SELECT movie_id, title, trailer_url FROM Movie ORDER BY movie_id'
    );
    
    movies.forEach(movie => {
      const status = movie.trailer_url ? '✓' : '○';
      console.log(`${status} [${movie.movie_id}] ${movie.title}: ${movie.trailer_url || 'No trailer'}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

addTrailers()
  .then(() => {
    console.log('\n✅ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
