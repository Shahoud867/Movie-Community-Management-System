const { pool } = require('../../config/db');

/**
 * Get personal analytics for a user
 */
async function getPersonalAnalytics(userId) {
  // Total movies watched (from watchlist with completed status)
  const [watchedCount] = await pool.query(
    `SELECT COUNT(*) as total_watched 
     FROM Watchlist 
     WHERE user_id = ? AND status = 'completed'`,
    [userId]
  );

  // Total hours spent watching movies
  const [hoursSpent] = await pool.query(
    `SELECT SUM(m.duration_minutes) as total_minutes
     FROM Watchlist w
     JOIN Movie m ON w.movie_id = m.movie_id
     WHERE w.user_id = ? AND w.status = 'completed'`,
    [userId]
  );

  // Total ratings given
  const [ratingsCount] = await pool.query(
    `SELECT COUNT(*) as total_ratings, AVG(score) as avg_rating
     FROM Rating
     WHERE user_id = ?`,
    [userId]
  );

  // Total reviews written
  const [reviewsCount] = await pool.query(
    `SELECT COUNT(*) as total_reviews FROM Review WHERE user_id = ?`,
    [userId]
  );

  // Watchlist count (to-watch + watching)
  const [watchlistCount] = await pool.query(
    `SELECT COUNT(*) as watchlist_count 
     FROM Watchlist 
     WHERE user_id = ? AND status IN ('to-watch', 'watching')`,
    [userId]
  );

  // Genre distribution (top 5 genres watched)
  const [genreStats] = await pool.query(
    `SELECT g.genre_name, COUNT(*) as count
     FROM Watchlist w
     JOIN Movie m ON w.movie_id = m.movie_id
     JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
     JOIN Genre g ON mg.genre_id = g.genre_id
     WHERE w.user_id = ? AND w.status = 'completed'
     GROUP BY g.genre_id, g.genre_name
     ORDER BY count DESC
     LIMIT 5`,
    [userId]
  );

  // Monthly activity (last 12 months)
  const [monthlyActivity] = await pool.query(
    `SELECT 
       DATE_FORMAT(w.added_date, '%Y-%m') as month,
       COUNT(*) as count
     FROM Watchlist w
     WHERE w.user_id = ? AND w.status = 'completed'
       AND w.added_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY month
     ORDER BY month ASC`,
    [userId]
  );

  // Top rated movies by user
  const [topRatedMovies] = await pool.query(
    `SELECT m.movie_id, m.title, m.poster, m.release_year, r.score as rating
     FROM Rating r
     JOIN Movie m ON r.movie_id = m.movie_id
     WHERE r.user_id = ?
     ORDER BY r.score DESC, r.rated_date DESC
     LIMIT 5`,
    [userId]
  );

  // Recent activity
  const [recentActivity] = await pool.query(
    `SELECT 
       'rating' as type, 
       m.title as movie_title,
       r.score as value,
       r.rated_date as date
     FROM Rating r
     JOIN Movie m ON r.movie_id = m.movie_id
     WHERE r.user_id = ?
     UNION ALL
     SELECT 
       'review' as type,
       m.title as movie_title,
       NULL as value,
       rv.created_date as date
     FROM Review rv
     JOIN Movie m ON rv.movie_id = m.movie_id
     WHERE rv.user_id = ?
     ORDER BY date DESC
     LIMIT 10`,
    [userId, userId]
  );

  // Favorite genre (most watched)
  const favoriteGenre = genreStats.length > 0 ? genreStats[0].genre_name : null;

  // Year in review stats
  const currentYear = new Date().getFullYear();
  const [yearStats] = await pool.query(
    `SELECT 
       COUNT(DISTINCT w.movie_id) as movies_this_year,
       SUM(m.duration_minutes) as minutes_this_year,
       COUNT(DISTINCT DATE(w.added_date)) as active_days
     FROM Watchlist w
     JOIN Movie m ON w.movie_id = m.movie_id
     WHERE w.user_id = ? 
       AND YEAR(w.added_date) = ?
       AND w.status = 'completed'`,
    [userId, currentYear]
  );

  // Top genre for current year
  const [yearGenre] = await pool.query(
    `SELECT g.genre_name, COUNT(*) as count
     FROM Watchlist w
     JOIN Movie m ON w.movie_id = m.movie_id
     JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
     JOIN Genre g ON mg.genre_id = g.genre_id
     WHERE w.user_id = ? 
       AND YEAR(w.added_date) = ?
       AND w.status = 'completed'
     GROUP BY g.genre_id, g.genre_name
     ORDER BY count DESC
     LIMIT 1`,
    [userId, currentYear]
  );

  return {
    overview: {
      total_watched: watchedCount[0].total_watched || 0,
      total_hours: Math.round((hoursSpent[0].total_minutes || 0) / 60),
      total_ratings: ratingsCount[0].total_ratings || 0,
      avg_rating: ratingsCount[0].avg_rating ? parseFloat(ratingsCount[0].avg_rating).toFixed(1) : 0,
      total_reviews: reviewsCount[0].total_reviews || 0,
      watchlist_count: watchlistCount[0].watchlist_count || 0,
      favorite_genre: favoriteGenre
    },
    genre_distribution: genreStats,
    monthly_activity: monthlyActivity,
    top_rated_movies: topRatedMovies,
    recent_activity: recentActivity,
    year_in_review: {
      year: currentYear,
      movies_watched: yearStats[0].movies_this_year || 0,
      hours_spent: Math.round((yearStats[0].minutes_this_year || 0) / 60),
      active_days: yearStats[0].active_days || 0,
      avg_per_week: ((yearStats[0].movies_this_year || 0) / 52).toFixed(1),
      favorite_genre: yearGenre.length > 0 ? yearGenre[0].genre_name : 'N/A'
    }
  };
}

/**
 * Get community-wide analytics
 */
async function getCommunityAnalytics() {
  // Most popular movies (by ratings count)
  const [popularMovies] = await pool.query(
    `SELECT 
       m.movie_id, 
       m.title, 
       m.poster, 
       m.release_year,
       m.average_rating as avg_rating,
       COUNT(DISTINCT r.rating_id) as rating_count,
       COUNT(DISTINCT w.user_id) as watch_count
     FROM Movie m
     LEFT JOIN Rating r ON m.movie_id = r.movie_id
     LEFT JOIN Watchlist w ON m.movie_id = w.movie_id AND w.status = 'completed'
     GROUP BY m.movie_id, m.title, m.poster, m.release_year, m.average_rating
     ORDER BY rating_count DESC, watch_count DESC
     LIMIT 10`
  );

  // Trending this week (most activity in last 7 days)
  const [trendingMovies] = await pool.query(
    `SELECT 
       m.movie_id,
       m.title,
       m.poster,
       m.release_year,
       COUNT(*) as recent_watches
     FROM (
       SELECT movie_id, rated_date as activity_date FROM Rating WHERE rated_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       UNION ALL
       SELECT movie_id, created_date as activity_date FROM Review WHERE created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       UNION ALL
       SELECT movie_id, added_date as activity_date FROM Watchlist WHERE added_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     ) as activity
     JOIN Movie m ON activity.movie_id = m.movie_id
     GROUP BY m.movie_id, m.title, m.poster, m.release_year
     ORDER BY recent_watches DESC
     LIMIT 10`
  );

  // Genre popularity
  const [genrePopularity] = await pool.query(
    `SELECT 
       g.genre_name,
       COUNT(DISTINCT w.user_id) as user_count,
       COUNT(w.watchlist_id) as total_watches
     FROM Genre g
     JOIN Movie_Genre mg ON g.genre_id = mg.genre_id
     JOIN Watchlist w ON mg.movie_id = w.movie_id
     WHERE w.status = 'completed'
     GROUP BY g.genre_id, g.genre_name
     ORDER BY total_watches DESC
     LIMIT 10`
  );

  // Overall stats
  const [overallStats] = await pool.query(
    `SELECT 
       (SELECT COUNT(*) FROM Users WHERE is_active = TRUE) as total_users,
       (SELECT COUNT(*) FROM Movie) as total_movies,
       (SELECT COUNT(*) FROM Rating) as total_ratings,
       (SELECT COUNT(*) FROM Review) as total_reviews,
       (SELECT COUNT(*) FROM Watchlist WHERE status = 'completed') as total_watches,
       (SELECT AVG(average_rating) FROM Movie WHERE average_rating IS NOT NULL) as avg_movie_rating`
  );

  // Recent community activity
  const [recentCommunityActivity] = await pool.query(
    `SELECT 
       u.name as user_name,
       m.title as movie_title,
       'rating' as activity_type,
       r.score as value,
       r.rated_date as activity_date
     FROM Rating r
     JOIN Users u ON r.user_id = u.user_id
     JOIN Movie m ON r.movie_id = m.movie_id
     WHERE r.rated_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     UNION ALL
     SELECT 
       u.name as user_name,
       m.title as movie_title,
       'review' as activity_type,
       NULL as value,
       rv.created_date as activity_date
     FROM Review rv
     JOIN Users u ON rv.user_id = u.user_id
     JOIN Movie m ON rv.movie_id = m.movie_id
     WHERE rv.created_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     ORDER BY activity_date DESC
     LIMIT 20`
  );

  return {
    overall_stats: overallStats[0],
    popular_movies: popularMovies,
    trending_this_week: trendingMovies,
    genre_popularity: genrePopularity,
    recent_activity: recentCommunityActivity
  };
}

module.exports = {
  getPersonalAnalytics,
  getCommunityAnalytics
};
