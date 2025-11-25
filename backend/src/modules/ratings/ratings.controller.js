const {
  getUserRating,
  getMovieRatings,
  upsertRating,
  deleteRating
} = require('./ratings.service');

async function getUserMovieRating(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);
    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
    
    const rating = await getUserRating(req.user.user_id, movieId);
    
    if (!rating) {
      return res.json({ score: null });
    }
    
    res.json(rating);
  } catch (err) {
    next(err);
  }
}

async function getMovieRatingsController(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);
    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
    
    const ratings = await getMovieRatings(movieId);
    res.json(ratings);
  } catch (err) {
    next(err);
  }
}

async function submitRating(req, res, next) {
  try {
    const { movie_id, score } = req.body;
    
    if (!movie_id || score === undefined || score === null) {
      return res.status(400).json({ error: 'Movie ID and score are required' });
    }
    
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 1.0 || numScore > 10.0) {
      return res.status(400).json({ error: 'Score must be between 1.0 and 10.0' });
    }
    
    const result = await upsertRating(req.user.user_id, movie_id, numScore);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function removeRating(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);
    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
    
    const result = await deleteRating(req.user.user_id, movieId);
    
    if (!result.success) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    
    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUserMovieRating,
  getMovieRatingsController,
  submitRating,
  removeRating
};
