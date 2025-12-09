const { pool } = require('../../config/db');

async function getMovies({
  genres = [],
  minYear,
  maxYear,
  minRating,
  maxRating,
  sort = 'recent',
  page = 1,
  limit = 20,
  search = '',
}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  // Search by title
  if (search) {
    conditions.push('m.title LIKE ?');
    params.push(`%${search}%`);
  }

  // Filter by year range
  if (minYear) {
    conditions.push('m.release_year >= ?');
    params.push(parseInt(minYear, 10));
  }
  if (maxYear) {
    conditions.push('m.release_year <= ?');
    params.push(parseInt(maxYear, 10));
  }

  // Filter by rating range
  if (minRating) {
    conditions.push('m.average_rating >= ?');
    params.push(parseFloat(minRating));
  }
  if (maxRating) {
    conditions.push('m.average_rating <= ?');
    params.push(parseFloat(maxRating));
  }

  // Filter by genres (if provided)
  let genreJoin = '';
  if (genres.length > 0) {
    genreJoin = `
      INNER JOIN Movie_Genre mg ON m.movie_id = mg.movie_id
      INNER JOIN Genre g ON mg.genre_id = g.genre_id
    `;
    const genrePlaceholders = genres.map(() => '?').join(',');
    conditions.push(`g.genre_id IN (${genrePlaceholders})`);
    params.push(...genres);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Sorting
  let orderBy = 'ORDER BY m.added_date DESC'; // Default: recent
  switch (sort) {
    case 'rating':
      orderBy = 'ORDER BY m.average_rating DESC, m.title ASC';
      break;
    case 'title':
      orderBy = 'ORDER BY m.title ASC';
      break;
    case 'year':
      orderBy = 'ORDER BY m.release_year DESC, m.title ASC';
      break;
    case 'popular':
      orderBy = 'ORDER BY m.view_count DESC, m.average_rating DESC';
      break;
    default:
      orderBy = 'ORDER BY m.added_date DESC';
  }

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT m.movie_id) as total
    FROM Movie m
    ${genreJoin}
    ${whereClause}
  `;
  const [countResult] = await pool.query(countQuery, params);
  const total = countResult[0].total;

  // Get movies with genres
  const moviesQuery = `
    SELECT DISTINCT
      m.movie_id, m.title, m.synopsis, m.release_year, m.poster,
      m.duration_minutes, m.language, m.director, m.average_rating,
      m.total_reviews, m.view_count, m.added_date, m.added_by_admin, m.trailer_url
    FROM Movie m
    ${genreJoin}
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  const [movies] = await pool.query(moviesQuery, params);

  // Fetch genres for each movie
  if (movies.length > 0) {
    const movieIds = movies.map((m) => m.movie_id);
    const genresQuery = `
      SELECT mg.movie_id, g.genre_id, g.genre_name
      FROM Movie_Genre mg
      INNER JOIN Genre g ON mg.genre_id = g.genre_id
      WHERE mg.movie_id IN (${movieIds.map(() => '?').join(',')})
    `;
    const [genresData] = await pool.query(genresQuery, movieIds);

    // Group genres by movie
    const genresByMovie = {};
    genresData.forEach((row) => {
      if (!genresByMovie[row.movie_id]) {
        genresByMovie[row.movie_id] = [];
      }
      genresByMovie[row.movie_id].push({
        genre_id: row.genre_id,
        genre_name: row.genre_name,
      });
    });

    // Attach genres to movies
    movies.forEach((movie) => {
      movie.genres = genresByMovie[movie.movie_id] || [];
    });
  }

  return {
    movies,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getMovieById(movieId) {
  const [movies] = await pool.query(
    `SELECT 
      m.movie_id, m.title, m.synopsis, m.release_year, m.poster,
      m.duration_minutes, m.language, m.director, m.average_rating,
      m.total_reviews, m.view_count, m.added_date, m.trailer_url,
      a.admin_id, a.name as added_by_name
    FROM Movie m
    LEFT JOIN Admin a ON m.added_by_admin = a.admin_id
    WHERE m.movie_id = ?`,
    [movieId]
  );

  if (movies.length === 0) {
    throw new Error('Movie not found');
  }

  const movie = movies[0];

  // Fetch genres
  const [genres] = await pool.query(
    `SELECT g.genre_id, g.genre_name
     FROM Movie_Genre mg
     INNER JOIN Genre g ON mg.genre_id = g.genre_id
     WHERE mg.movie_id = ?`,
    [movieId]
  );

  movie.genres = genres;

  // Increment view count
  await pool.query('UPDATE Movie SET view_count = view_count + 1 WHERE movie_id = ?', [movieId]);

  return movie;
}

async function getMovieGenres(movieId) {
  const [genres] = await pool.query(
    `SELECT g.genre_id, g.genre_name, g.description 
     FROM genre g
     INNER JOIN movie_genre mg ON g.genre_id = mg.genre_id
     WHERE mg.movie_id = ?
     ORDER BY g.genre_name ASC`,
    [movieId]
  );
  return genres;
}

async function getAllGenres() {
  const [genres] = await pool.query(
    'SELECT genre_id, genre_name, description FROM genre ORDER BY genre_name ASC'
  );
  return genres;
}

/**
 * Get Top 10 Highest Rated Movies
 */
async function getTopRatedMovies(limit = 10) {
  const [movies] = await pool.query(
    `SELECT 
      m.movie_id, m.title, m.synopsis, m.release_year, m.poster,
      m.duration_minutes, m.language, m.director, m.average_rating,
      m.total_reviews, m.view_count, m.trailer_url
    FROM Movie m
    WHERE m.total_reviews >= 1
    ORDER BY m.average_rating DESC, m.total_reviews DESC
    LIMIT ?`,
    [limit]
  );

  // Fetch genres for each movie
  if (movies.length > 0) {
    const movieIds = movies.map((m) => m.movie_id);
    const genresQuery = `
      SELECT mg.movie_id, g.genre_id, g.genre_name
      FROM Movie_Genre mg
      INNER JOIN Genre g ON mg.genre_id = g.genre_id
      WHERE mg.movie_id IN (${movieIds.map(() => '?').join(',')})
    `;
    const [genresData] = await pool.query(genresQuery, movieIds);

    const genresByMovie = {};
    genresData.forEach((row) => {
      if (!genresByMovie[row.movie_id]) {
        genresByMovie[row.movie_id] = [];
      }
      genresByMovie[row.movie_id].push({
        genre_id: row.genre_id,
        genre_name: row.genre_name,
      });
    });

    movies.forEach((movie) => {
      movie.genres = genresByMovie[movie.movie_id] || [];
    });
  }

  return movies;
}

/**
 * Get Top 10 Trending/Most Watched Movies
 */
async function getTrendingMovies(limit = 10) {
  const [movies] = await pool.query(
    `SELECT 
      m.movie_id, m.title, m.synopsis, m.release_year, m.poster,
      m.duration_minutes, m.language, m.director, m.average_rating,
      m.total_reviews, m.view_count, m.trailer_url,
      (SELECT COUNT(*) FROM Watchlist w WHERE w.movie_id = m.movie_id) as watchlist_count
    FROM Movie m
    ORDER BY m.view_count DESC, watchlist_count DESC, m.average_rating DESC
    LIMIT ?`,
    [limit]
  );

  // Fetch genres for each movie
  if (movies.length > 0) {
    const movieIds = movies.map((m) => m.movie_id);
    const genresQuery = `
      SELECT mg.movie_id, g.genre_id, g.genre_name
      FROM Movie_Genre mg
      INNER JOIN Genre g ON mg.genre_id = g.genre_id
      WHERE mg.movie_id IN (${movieIds.map(() => '?').join(',')})
    `;
    const [genresData] = await pool.query(genresQuery, movieIds);

    const genresByMovie = {};
    genresData.forEach((row) => {
      if (!genresByMovie[row.movie_id]) {
        genresByMovie[row.movie_id] = [];
      }
      genresByMovie[row.movie_id].push({
        genre_id: row.genre_id,
        genre_name: row.genre_name,
      });
    });

    movies.forEach((movie) => {
      movie.genres = genresByMovie[movie.movie_id] || [];
    });
  }

  return movies;
}

module.exports = {
  getMovies,
  getMovieById,
  getMovieGenres,
  getAllGenres,
  getTopRatedMovies,
  getTrendingMovies,
};
