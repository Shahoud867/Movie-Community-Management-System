const {
  getMovieReviews,
  getUserReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} = require('./reviews.service');

async function getReviewsForMovie(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId);
    if (!movieId) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }
    
    const reviews = await getMovieReviews(movieId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

async function getReviewsByUser(req, res, next) {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const reviews = await getUserReviews(userId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

async function postReview(req, res, next) {
  try {
    const { movie_id, review_text, is_spoiler } = req.body;
    
    if (!movie_id || !review_text) {
      return res.status(400).json({ error: 'Movie ID and review text are required' });
    }
    
    const result = await createReview(
      req.user.user_id,
      movie_id,
      review_text,
      is_spoiler
    );
    
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'You have already reviewed this movie') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function editReview(req, res, next) {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (!reviewId) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const { review_text, is_spoiler } = req.body;
    
    const result = await updateReview(reviewId, req.user.user_id, {
      review_text,
      is_spoiler,
    });
    
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('permission')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function removeReview(req, res, next) {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (!reviewId) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const result = await deleteReview(reviewId, req.user.user_id);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('permission')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function markHelpful(req, res, next) {
  try {
    const reviewId = parseInt(req.params.reviewId);
    if (!reviewId) {
      return res.status(400).json({ error: 'Invalid review ID' });
    }
    
    const result = await markReviewHelpful(reviewId, req.user.user_id);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getReviewsForMovie,
  getReviewsByUser,
  postReview,
  editReview,
  removeReview,
  markHelpful,
};
