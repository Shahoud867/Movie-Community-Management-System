const { pool } = require('../../config/db');

/**
 * Get user's rating for a specific movie
 */
async function getUserRating(userId, movieId) {
  const [ratings] = await pool.query(
    'SELECT rating_id, user_id, movie_id, score, rated_date FROM Rating WHERE user_id = ? AND movie_id = ?',
    [userId, movieId]
  );
  
  return ratings[0] || null;
}

/**
 * Get all ratings for a movie
 */
async function getMovieRatings(movieId) {
  const [ratings] = await pool.query(
    `SELECT 
      r.rating_id,
      r.user_id,
      r.movie_id,
      r.score,
      r.rated_date,
      u.name as user_name
    FROM Rating r
    JOIN Users u ON r.user_id = u.user_id
    WHERE r.movie_id = ?
    ORDER BY r.rated_date DESC`,
    [movieId]
  );
  
  return ratings;
}

/**
 * Create or update a rating
 */
async function upsertRating(userId, movieId, score) {
  // Check if rating already exists
  const existing = await getUserRating(userId, movieId);
  
  if (existing) {
    // Update existing rating
    await pool.query(
      'UPDATE Rating SET score = ?, rated_date = CURRENT_TIMESTAMP WHERE user_id = ? AND movie_id = ?',
      [score, userId, movieId]
    );
    
    // Update movie average
    await updateMovieAverageRating(movieId);
    
    return {
      rating_id: existing.rating_id,
      user_id: userId,
      movie_id: movieId,
      score,
      message: 'Rating updated successfully'
    };
  } else {
    // Insert new rating
    const [result] = await pool.query(
      'INSERT INTO Rating (user_id, movie_id, score) VALUES (?, ?, ?)',
      [userId, movieId, score]
    );
    
    // Update movie average
    await updateMovieAverageRating(movieId);
    
    return {
      rating_id: result.insertId,
      user_id: userId,
      movie_id: movieId,
      score,
      message: 'Rating created successfully'
    };
  }
}

/**
 * Delete a rating
 */
async function deleteRating(userId, movieId) {
  const [result] = await pool.query(
    'DELETE FROM Rating WHERE user_id = ? AND movie_id = ?',
    [userId, movieId]
  );
  
  if (result.affectedRows > 0) {
    await updateMovieAverageRating(movieId);
  }
  
  return { success: result.affectedRows > 0 };
}

/**
 * Update movie's average rating
 */
async function updateMovieAverageRating(movieId) {
  const [result] = await pool.query(
    `UPDATE Movie m
     SET average_rating = (
       SELECT COALESCE(AVG(score), 0)
       FROM Rating
       WHERE movie_id = ?
     )
     WHERE m.movie_id = ?`,
    [movieId, movieId]
  );
  
  return result;
}

module.exports = {
  getUserRating,
  getMovieRatings,
  upsertRating,
  deleteRating,
  updateMovieAverageRating
};
