const express = require('express');
const {
  getUserMovieRating,
  getMovieRatingsController,
  submitRating,
  removeRating
} = require('./ratings.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Get all ratings for a movie (public)
router.get('/movie/:movieId', getMovieRatingsController);

// Get user's rating for a specific movie (authenticated)
router.get('/:movieId', authenticate, getUserMovieRating);

// Submit or update rating (authenticated)
router.post('/', authenticate, submitRating);

// Delete rating (authenticated)
router.delete('/:movieId', authenticate, removeRating);

module.exports = { ratingsRouter: router };
