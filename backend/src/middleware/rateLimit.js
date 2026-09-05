const rateLimit = require('express-rate-limit');

// General limiter: applied to every /api request as a basic abuse backstop.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Strict limiter for credential-guessing-prone endpoints: user login, admin
// login, registration, and password reset requests.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});

module.exports = { apiLimiter, authLimiter };
