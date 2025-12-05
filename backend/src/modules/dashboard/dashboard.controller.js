const { 
  getDashboardSummary,
  getFriendRecommendations,
  getUserEngagementScore,
  getTopEngagedUsers
} = require('./dashboard.service');

async function getSummary(req, res, next) {
  try {
    const summary = await getDashboardSummary(req.user.user_id);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

/**
 * Get friend-based movie recommendations
 * Uses fn_get_friend_recommendation_score and fn_matches_user_preference functions
 */
async function getFriendBasedRecommendations(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recommendations = await getFriendRecommendations(req.user.user_id, limit);
    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
}

/**
 * Get user's engagement score
 * Uses fn_user_engagement_score function
 */
async function getEngagementScore(req, res, next) {
  try {
    const score = await getUserEngagementScore(req.user.user_id);
    res.json({ user_id: req.user.user_id, engagement_score: score });
  } catch (err) {
    next(err);
  }
}

/**
 * Get leaderboard of most engaged users
 * Uses fn_user_engagement_score function
 */
async function getLeaderboard(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const users = await getTopEngagedUsers(limit);
    res.json({ leaderboard: users });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  getSummary,
  getFriendBasedRecommendations,
  getEngagementScore,
  getLeaderboard
};
