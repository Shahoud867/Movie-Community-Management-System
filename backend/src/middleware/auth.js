const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user from DB to ensure they still exist and are active
    const [users] = await pool.query(
      'SELECT user_id, name, email, fav_genre, profile_picture, bio, joined_date, is_active FROM Users WHERE user_id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Fetch admin from DB
    const [admins] = await pool.query(
      'SELECT admin_id, name, email, role, is_super_admin FROM Admin WHERE admin_id = ?',
      [decoded.adminId]
    );

    if (admins.length === 0) {
      return res.status(403).json({ error: 'Admin not found' });
    }

    req.admin = admins[0];
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { authenticate, requireAdmin };
