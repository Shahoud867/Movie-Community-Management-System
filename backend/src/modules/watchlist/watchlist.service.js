const { pool } = require('../../config/db');

/**
 * Get watchlist items for a user
 */
async function getUserWatchlist(userId, status = null) {
  let query = `
    SELECT 
      w.watchlist_id,
      w.user_id,
      w.movie_id,
      w.status,
      w.added_date,
      w.last_update,
      w.progress_percent,
      m.title,
      m.release_year,
      m.poster as poster_url,
      m.average_rating
    FROM Watchlist w
    JOIN Movie m ON w.movie_id = m.movie_id
    WHERE w.user_id = ?
  `;

  const params = [userId];

  if (status) {
    query += ` AND w.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY w.last_update DESC`;

  const [items] = await pool.query(query, params);
  return items;
}

/**
 * Get a specific watchlist item
 */
async function getWatchlistItem(userId, movieId) {
  const [items] = await pool.query(
    `SELECT * FROM Watchlist WHERE user_id = ? AND movie_id = ?`,
    [userId, movieId]
  );
  return items[0] || null;
}

/**
 * Add movie to watchlist
 */
async function addToWatchlist(userId, movieId, status = 'to-watch') {
  const existing = await getWatchlistItem(userId, movieId);
  if (existing) {
    // If status provided and different, update it in-place (idempotent upsert behavior)
    if (status && status !== existing.status) {
      await pool.query(
        `UPDATE Watchlist SET status = ? WHERE user_id = ? AND movie_id = ?`,
        [status, userId, movieId]
      );
      return { ...existing, status, was_created: false };
    }
    return { ...existing, was_created: false };
  }

  const [result] = await pool.query(
    `INSERT INTO Watchlist (user_id, movie_id, status, progress_percent) VALUES (?, ?, ?, 0)`,
    [userId, movieId, status]
  );

  return {
    watchlist_id: result.insertId,
    user_id: userId,
    movie_id: movieId,
    status,
    progress_percent: 0,
    was_created: true,
  };
}

/**
 * Update watchlist item
 */
async function updateWatchlistItem(userId, movieId, updates) {
  const { status, progress_percent } = updates;

  // Check if item exists
  const existing = await getWatchlistItem(userId, movieId);
  if (!existing) {
    throw new Error('Movie not in watchlist');
  }

  const fieldsToUpdate = [];
  const values = [];

  if (status !== undefined) {
    fieldsToUpdate.push('status = ?');
    values.push(status);
  }

  if (progress_percent !== undefined) {
    fieldsToUpdate.push('progress_percent = ?');
    values.push(progress_percent);
  }

  if (fieldsToUpdate.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId, movieId);

  await pool.query(
    `UPDATE Watchlist SET ${fieldsToUpdate.join(', ')} WHERE user_id = ? AND movie_id = ?`,
    values
  );

  return await getWatchlistItem(userId, movieId);
}

/**
 * Remove movie from watchlist
 */
async function removeFromWatchlist(userId, movieId) {
  const [result] = await pool.query(
    `DELETE FROM Watchlist WHERE user_id = ? AND movie_id = ?`,
    [userId, movieId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Movie not in watchlist');
  }

  return { message: 'Movie removed from watchlist' };
}

module.exports = {
  getUserWatchlist,
  getWatchlistItem,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
};
