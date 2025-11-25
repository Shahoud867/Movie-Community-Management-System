const { getMovies, getMovieById, getMovieGenres, getAllGenres } = require('./movies.service');

async function listMovies(req, res, next) {
  try {
    const {
      genres,
      minYear,
      maxYear,
      minRating,
      maxRating,
      sort,
      page,
      limit,
      search,
    } = req.query;

    // Parse genres if provided as comma-separated string
    const genreArray = genres ? genres.split(',').map((g) => g.trim()) : [];

    const result = await getMovies({
      genres: genreArray,
      minYear,
      maxYear,
      minRating,
      maxRating,
      sort,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMovie(req, res, next) {
  try {
    const movieId = parseInt(req.params.id, 10);

    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const movie = await getMovieById(movieId);
    res.json(movie);
  } catch (err) {
    if (err.message === 'Movie not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function listGenres(req, res, next) {
  try {
    const genres = await getAllGenres();
    res.json(genres);
  } catch (err) {
    next(err);
  }
}

async function getMovieGenresController(req, res, next) {
  try {
    const { id } = req.params;
    const genres = await getMovieGenres(id);
    res.json(genres);
  } catch (err) {
    next(err);
  }
}

async function searchMovies(req, res, next) {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.json([]);
    }
    
    const result = await getMovies({
      search: query.trim(),
      limit: 10,
      page: 1,
    });
    
    res.json(result.movies || []);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMovies,
  getMovie,
  listGenres,
  getMovieGenresController,
  searchMovies,
};
