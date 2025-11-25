const {
  getUserWatchlist,
  getWatchlistItem,
  addToWatchlist,
  updateWatchlistItem,
  removeFromWatchlist,
} = require('./watchlist.service');

/**
 * Get user's watchlist
 * Query params: status (optional) - filter by status ('to-watch', 'watching', 'completed')
 */
async function getWatchlist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { status } = req.query;

    const items = await getUserWatchlist(userId, status);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * Get watchlist for a specific user (for profile viewing)
 */
async function getUserWatchlistById(req, res, next) {
  try {
    const userId = parseInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { status } = req.query;
    const items = await getUserWatchlist(userId, status);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

/**
 * Add movie to watchlist
 * Body: { movie_id, status? }
 */
async function addMovie(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { movie_id, status } = req.body;

    if (!movie_id) {
      return res.status(400).json({ error: 'movie_id is required' });
    }

    const item = await addToWatchlist(userId, movie_id, status);
    // Respond 201 if newly created, 200 if existing (idempotent)
    res.status(item.was_created ? 201 : 200).json(item);
  } catch (err) {
    next(err);
  }
}

/**
 * Update watchlist item
 * Body: { status?, progress_percent? }
 */
async function updateMovie(req, res, next) {
  try {
    const userId = req.user.user_id;
    const movieId = parseInt(req.params.movieId);
    const { status, progress_percent } = req.body;

    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const updated = await updateWatchlistItem(userId, movieId, {
      status,
      progress_percent,
    });

    res.json(updated);
  } catch (err) {
    if (err.message === 'Movie not in watchlist') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * Remove movie from watchlist
 */
async function removeMovie(req, res, next) {
  try {
    const userId = req.user.user_id;
    const movieId = parseInt(req.params.movieId);

    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const result = await removeFromWatchlist(userId, movieId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Movie not in watchlist') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getWatchlist,
  getUserWatchlistById,
  addMovie,
  updateMovie,
  removeMovie,
};
