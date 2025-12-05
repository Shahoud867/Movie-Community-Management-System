const express = require('express');
const { 
  getSummary,
  getFriendBasedRecommendations,
  getEngagementScore,
  getLeaderboard
} = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Dashboard summary (uses sp_get_user_dashboard stored procedure)
router.get('/', authenticate, getSummary);
router.get('/summary', authenticate, getSummary);

// Friend-based recommendations (uses fn_get_friend_recommendation_score function)
router.get('/recommendations/friends', authenticate, getFriendBasedRecommendations);

// User engagement score (uses fn_user_engagement_score function)
router.get('/engagement', authenticate, getEngagementScore);

// Leaderboard - top engaged users (uses fn_user_engagement_score function)
router.get('/leaderboard', authenticate, getLeaderboard);

module.exports = { dashboardRouter: router };
