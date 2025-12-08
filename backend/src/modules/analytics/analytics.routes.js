const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   GET /api/analytics/personal
 * @desc    Get personal analytics for current user
 * @access  Private
 */
router.get('/personal', authenticate, analyticsController.getPersonalAnalytics);

/**
 * @route   GET /api/analytics/community
 * @desc    Get community-wide analytics
 * @access  Private
 */
router.get('/community', authenticate, analyticsController.getCommunityAnalytics);

module.exports = { analyticsRouter: router };
