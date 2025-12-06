const express = require('express');
const {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPasswordController,
  validateToken,
  changePassword,
} = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', logout);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordController);
router.get('/validate-reset-token', validateToken);

// Change password (authenticated)
router.post('/change-password', authenticate, changePassword);

module.exports = { authRouter: router };
