const express = require('express');
const { getSummary } = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getSummary);
router.get('/summary', authenticate, getSummary);

module.exports = { dashboardRouter: router };
