const analyticsService = require('./analytics.service');

/**
 * Get personal analytics for logged-in user
 */
async function getPersonalAnalytics(req, res, next) {
  try {
    const userId = req.user.user_id;
    const analytics = await analyticsService.getPersonalAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

/**
 * Get community-wide analytics
 */
async function getCommunityAnalytics(req, res, next) {
  try {
    const analytics = await analyticsService.getCommunityAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPersonalAnalytics,
  getCommunityAnalytics
};
