const express = require('express');
const {
  getMe,
  getUserById,
  updateMe,
  changePassword,
  changeEmail,
  getUserFriends,
  getUserWatchlistById,
  getUserReviewsById,
} = require('./users.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.get('/me', authenticate, getMe);
router.get('/:id', authenticate, getUserById);
router.get('/:id/friends', authenticate, getUserFriends);
router.get('/:id/watchlist', authenticate, getUserWatchlistById);
router.get('/:id/reviews', authenticate, getUserReviewsById);
router.patch('/me', authenticate, updateMe);
router.patch('/me/password', authenticate, changePassword);
router.patch('/me/email', authenticate, changeEmail);

module.exports = { usersRouter: router };
