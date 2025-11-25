const express = require('express');
const { listGenres } = require('../modules/movies/movies.controller');

const router = express.Router();

router.get('/', listGenres);

module.exports = { genresRouter: router };
