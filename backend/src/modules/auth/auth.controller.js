const {
  registerUser,
  loginUser,
  loginAdmin,
  getUserById,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
} = require('./auth.service');

async function register(req, res, next) {
  try {
    const { name, email, password, fav_genre, bio } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { user, token } = await registerUser({ name, email, password, fav_genre, bio });

    // Also set JWT as httpOnly cookie for frontend pages served by the backend
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.message === 'Email already registered') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, isAdmin } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let result;
    if (isAdmin) {
      result = await loginAdmin({ email, password });
    } else {
      result = await loginUser({ email, password });
    }

    // Set JWT as httpOnly cookie for same-origin frontend
    res.cookie('token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid email or password' || err.message === 'Account is inactive') {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.user is set by authenticate middleware
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  // Clear auth cookie; client should also drop any stored token
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' });
  res.json({ message: 'Logged out successfully' });
}

/**
 * Request password reset - send email with reset link
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const result = await requestPasswordReset(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Reset password using token
 */
async function resetPasswordController(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const result = await resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    if (err.message === 'Invalid or expired reset token') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * Validate reset token
 */
async function validateToken(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const result = await validateResetToken(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPasswordController,
  validateToken,
};
