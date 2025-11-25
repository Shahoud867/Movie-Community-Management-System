const express = require('express');
const { dbHealthcheck } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  let db = 'ok';
  try {
    await dbHealthcheck();
  } catch (e) {
    db = 'error';
  }
  res.status(200).json({ status: 'ok', db, time: new Date().toISOString() });
});

module.exports = { healthRouter: router };
