const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Middleware to verify admin authentication
 */
async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify admin exists and is active
    const [admins] = await pool.query(
      'SELECT admin_id, name, email, role, is_super_admin FROM Admin WHERE admin_id = ?',
      [decoded.admin_id]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    
    req.admin = admins[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(err);
  }
}

/**
 * Middleware to require super admin privileges
 */
function requireSuperAdmin(req, res, next) {
  if (!req.admin) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  if (!req.admin.is_super_admin) {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }
  
  next();
}

/**
 * Log admin action to audit trail
 */
async function logAuditTrail(adminId, operation, targetTable, targetId, oldValue, newValue, ipAddress) {
  try {
    await pool.query(
      `INSERT INTO Audit_Trail (admin_id, operation, target_table, target_id, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [adminId, operation, targetTable, targetId, oldValue, newValue, ipAddress]
    );
  } catch (err) {
    console.error('Failed to log audit trail:', err);
  }
}

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  logAuditTrail,
};
