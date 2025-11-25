const express = require('express');
const {
  getReviewsForMovie,
  getReviewsByUser,
  postReview,
  editReview,
  removeReview,
  markHelpful,
} = require('./reviews.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Get reviews for a specific movie (public)
router.get('/movie/:movieId', getReviewsForMovie);

// Get reviews by a specific user (public)
router.get('/user/:userId', getReviewsByUser);

// Create, update, delete reviews (authenticated)
router.post('/', authenticate, postReview);
router.patch('/:reviewId', authenticate, editReview);
router.delete('/:reviewId', authenticate, removeReview);

// Mark review as helpful (authenticated)
router.post('/:reviewId/helpful', authenticate, markHelpful);

module.exports = { reviewsRouter: router };
