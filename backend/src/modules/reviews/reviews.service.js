const { pool } = require('../../config/db');

/**
 * Get reviews for a specific movie
 */
async function getMovieReviews(movieId) {
  const [reviews] = await pool.query(
    `SELECT 
      r.review_id,
      r.user_id,
      r.movie_id,
      r.review_text,
      r.created_date,
      r.last_edited,
      r.is_spoiler,
      r.helpful_count,
      u.name as user_name,
      u.profile_picture
    FROM Review r
    JOIN Users u ON r.user_id = u.user_id
    WHERE r.movie_id = ?
    ORDER BY r.created_date DESC`,
    [movieId]
  );
  
  return reviews;
}

/**
 * Get reviews by a specific user
 */
async function getUserReviews(userId) {
  const [reviews] = await pool.query(
    `SELECT 
      r.review_id,
      r.user_id,
      r.movie_id,
      r.review_text,
      r.created_date,
      r.last_edited,
      r.is_spoiler,
      r.helpful_count,
      m.title as movie_title,
      m.poster as poster_url
    FROM Review r
    JOIN Movie m ON r.movie_id = m.movie_id
    WHERE r.user_id = ?
    ORDER BY r.created_date DESC`,
    [userId]
  );
  
  return reviews;
}

/**
 * Create a new review
 */
async function createReview(userId, movieId, reviewText, isSpoiler = false) {
  // Check if user already reviewed this movie
  const [existing] = await pool.query(
    'SELECT review_id FROM Review WHERE user_id = ? AND movie_id = ?',
    [userId, movieId]
  );
  
  if (existing.length > 0) {
    throw new Error('You have already reviewed this movie');
  }
  
  const [result] = await pool.query(
    'INSERT INTO Review (user_id, movie_id, review_text, is_spoiler) VALUES (?, ?, ?, ?)',
    [userId, movieId, reviewText, isSpoiler]
  );
  
  return {
    review_id: result.insertId,
    user_id: userId,
    movie_id: movieId,
    review_text: reviewText,
    is_spoiler: isSpoiler,
    message: 'Review created successfully'
  };
}

/**
 * Create review with rating using stored procedure (for atomic transaction)
 */
async function createReviewWithRating(userId, movieId, reviewText, rating) {
  // Use stored procedure for atomic review + rating insertion
  const [result] = await pool.query(
    'CALL sp_add_review_with_rating(?, ?, ?, ?)',
    [userId, movieId, reviewText, rating]
  );
  
  return {
    message: result[0][0].message,
    user_id: userId,
    movie_id: movieId
  };
}

/**
 * Update a review
 */
async function updateReview(reviewId, userId, updates) {
  const { review_text, is_spoiler } = updates;
  
  // Verify ownership
  const [review] = await pool.query(
    'SELECT review_id FROM Review WHERE review_id = ? AND user_id = ?',
    [reviewId, userId]
  );
  
  if (review.length === 0) {
    throw new Error('Review not found or you do not have permission to edit it');
  }
  
  const fields = [];
  const values = [];
  
  if (review_text) {
    fields.push('review_text = ?');
    values.push(review_text);
  }
  
  if (is_spoiler !== undefined) {
    fields.push('is_spoiler = ?');
    values.push(is_spoiler);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  fields.push('last_edited = CURRENT_TIMESTAMP');
  values.push(reviewId, userId);
  
  await pool.query(
    `UPDATE Review SET ${fields.join(', ')} WHERE review_id = ? AND user_id = ?`,
    values
  );
  
  return { message: 'Review updated successfully' };
}

/**
 * Delete a review
 */
async function deleteReview(reviewId, userId) {
  const [result] = await pool.query(
    'DELETE FROM Review WHERE review_id = ? AND user_id = ?',
    [reviewId, userId]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Review not found or you do not have permission to delete it');
  }
  
  return { message: 'Review deleted successfully' };
}

/**
 * Mark a review as helpful
 */
async function markReviewHelpful(reviewId, userId) {
  // Check if the review exists
  const [review] = await pool.query(
    'SELECT review_id FROM Review WHERE review_id = ?',
    [reviewId]
  );
  
  if (review.length === 0) {
    throw new Error('Review not found');
  }
  
  // Increment the helpful count
  await pool.query(
    'UPDATE Review SET helpful_count = helpful_count + 1 WHERE review_id = ?',
    [reviewId]
  );
  
  // Get the updated count
  const [updated] = await pool.query(
    'SELECT helpful_count FROM Review WHERE review_id = ?',
    [reviewId]
  );
  
  return { 
    message: 'Review marked as helpful',
    helpful_count: updated[0].helpful_count 
  };
}

module.exports = {
  getMovieReviews,
  getUserReviews,
  createReview,
  createReviewWithRating,
  updateReview,
  deleteReview,
  markReviewHelpful,
};
