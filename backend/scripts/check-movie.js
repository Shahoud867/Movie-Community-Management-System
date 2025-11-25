const { pool } = require('../src/config/db');

async function checkMovie() {
  try {
    const [movies] = await pool.query(
      'SELECT * FROM Movie WHERE movie_id = 1'
    );
    
    if (movies.length === 0) {
      console.log('No movie found with ID 1');
    } else {
      console.log('Movie data for ID 1:');
      console.log(JSON.stringify(movies[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkMovie();
