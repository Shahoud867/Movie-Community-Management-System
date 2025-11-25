const express = require('express');
const { register, login, me, logout } = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', logout);

module.exports = { authRouter: router };
