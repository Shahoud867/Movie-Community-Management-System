const express = require('express');
const {
  getWatchlist,
  addMovie,
  updateMovie,
  removeMovie,
} = require('./watchlist.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// All watchlist routes require authentication
router.get('/', authenticate, getWatchlist);
router.post('/', authenticate, addMovie);
router.patch('/:movieId', authenticate, updateMovie);
router.delete('/:movieId', authenticate, removeMovie);

module.exports = { watchlistRouter: router };
