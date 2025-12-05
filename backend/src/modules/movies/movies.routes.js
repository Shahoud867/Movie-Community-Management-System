const express = require('express');
const { listMovies, getMovie, listGenres, getMovieGenresController, searchMovies, getTopRated, getTrending } = require('./movies.controller');

const router = express.Router();

// Public routes (no auth required for browsing movies)
router.get('/search', searchMovies);
router.get('/top-rated', getTopRated);
router.get('/trending', getTrending);
router.get('/', listMovies);
router.get('/:id', getMovie);
router.get('/:id/genres', getMovieGenresController);

module.exports = { moviesRouter: router };
