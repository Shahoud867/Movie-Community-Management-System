const { pool } = require('../../config/db');

/**
 * Get dashboard summary using stored procedure and functions
 */
async function getDashboardSummary(userId) {
  // Try to use stored procedure first
  try {
    const [results] = await pool.query('CALL sp_get_user_dashboard(?)', [userId]);
    // Stored procedure returns multiple result sets
    const userStats = results[0]?.[0] || {};
    const recommendedMovies = results[1] || [];
    const upcomingEvents = results[2] || [];
    
    return {
      watchlist: {
        total: (userStats.watchlist_count || 0) + (userStats.watched_count || 0),
        to_watch: userStats.watchlist_count || 0,
        watching: 0,
        completed: userStats.watched_count || 0
      },
      recommendedMovies,
      upcomingEvents,
      userStats: {
        review_count: userStats.reviews_count || 0,
        friend_count: userStats.friends_count || 0
      }
    };
  } catch (error) {
    // Fallback to manual queries if stored procedure doesn't exist
    return getDashboardSummaryManual(userId);
  }
}

/**
 * Manual fallback for dashboard summary
 */
async function getDashboardSummaryManual(userId) {
  // Get user's watchlist stats
  const [watchlistStats] = await pool.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'to-watch' THEN 1 ELSE 0 END) as to_watch,
      SUM(CASE WHEN status = 'watching' THEN 1 ELSE 0 END) as watching,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM Watchlist
    WHERE user_id = ?`,
    [userId]
  );

  // Get recommended movies (based on user's fav_genre and highly rated)
  const [user] = await pool.query('SELECT fav_genre FROM Users WHERE user_id = ?', [userId]);
  const favGenre = user[0]?.fav_genre;

  let recommendedMovies = [];
  if (favGenre) {
    const [movies] = await pool.query(
      `SELECT m.movie_id, m.title, m.poster, m.average_rating, m.release_year, m.view_count
       FROM Movie m
       INNER JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
       INNER JOIN Genre g ON mg.genre_id = g.genre_id
       WHERE g.genre_name = ? AND m.average_rating >= 8.0
       GROUP BY m.movie_id
       ORDER BY m.average_rating DESC, m.view_count DESC
       LIMIT 6`,
      [favGenre]
    );
    recommendedMovies = movies;
  }

  // If not enough recommended, get popular movies
  if (recommendedMovies.length < 6) {
    const [popular] = await pool.query(
      `SELECT movie_id, title, poster, average_rating, release_year
       FROM Movie
       WHERE average_rating >= 8.0
       ORDER BY view_count DESC, average_rating DESC
       LIMIT 6`
    );
    recommendedMovies = popular;
  }

  // Get upcoming events
  const [upcomingEvents] = await pool.query(
    `SELECT e.event_id, e.title, e.event_datetime, e.capacity, e.current_participants,
            m.title as movie_title, m.poster as movie_poster,
            u.name as host_name
     FROM Event e
     INNER JOIN Movie m ON e.movie_id = m.movie_id
     INNER JOIN Users u ON e.host_id = u.user_id
     WHERE e.event_datetime > NOW() AND e.status = 'scheduled'
     ORDER BY e.event_datetime ASC
     LIMIT 5`
  );

  // Get user's recent activity count
  const [activityStats] = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM Review WHERE user_id = ?) as review_count,
      (SELECT COUNT(*) FROM Rating WHERE user_id = ?) as rating_count,
      (SELECT COUNT(*) FROM Post WHERE user_id = ?) as post_count,
      (SELECT COUNT(*) FROM Friendship WHERE (sender_id = ? OR receiver_id = ?) AND status = 'accepted') as friend_count
    `,
    [userId, userId, userId, userId, userId]
  );

  return {
    watchlist: watchlistStats[0],
    recommendedMovies,
    upcomingEvents,
    userStats: activityStats[0],
  };
}

/**
 * Get friend-based movie recommendations using function
 */
async function getFriendRecommendations(userId, limit = 10) {
  try {
    // Use the database function for friend-based recommendations
    const [movies] = await pool.query(
      `SELECT m.movie_id, m.title, m.poster, m.average_rating, m.release_year,
              fn_get_friend_recommendation_score(?, m.movie_id) AS friend_score,
              fn_matches_user_preference(?, m.movie_id) AS matches_preference
       FROM Movie m
       WHERE m.movie_id NOT IN (SELECT movie_id FROM Watchlist WHERE user_id = ?)
       HAVING friend_score > 0 OR matches_preference = TRUE
       ORDER BY friend_score DESC, matches_preference DESC, m.average_rating DESC
       LIMIT ?`,
      [userId, userId, userId, limit]
    );
    return movies;
  } catch (error) {
    // Fallback if functions don't exist
    return [];
  }
}

/**
 * Get user engagement score using function
 */
async function getUserEngagementScore(userId) {
  try {
    const [result] = await pool.query(
      'SELECT fn_user_engagement_score(?) AS engagement_score',
      [userId]
    );
    return result[0]?.engagement_score || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Get top engaged users (leaderboard)
 */
async function getTopEngagedUsers(limit = 10) {
  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.name, u.profile_picture,
              fn_user_engagement_score(u.user_id) AS engagement_score
       FROM Users u
       WHERE u.is_active = TRUE
       ORDER BY engagement_score DESC
       LIMIT ?`,
      [limit]
    );
    return users;
  } catch (error) {
    return [];
  }
}

module.exports = { 
  getDashboardSummary,
  getFriendRecommendations,
  getUserEngagementScore,
  getTopEngagedUsers
};
