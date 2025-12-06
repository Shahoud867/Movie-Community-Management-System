const { pool } = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { sendPasswordResetEmail } = require('../../utils/email');
const crypto = require('crypto');

async function registerUser({ name, email, password, fav_genre, bio }) {
  // Check if user already exists
  const [existing] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const [result] = await pool.query(
    'INSERT INTO Users (name, email, password, fav_genre, bio) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, fav_genre || null, bio || null]
  );

  const userId = result.insertId;

  // Fetch created user
  const [users] = await pool.query(
    'SELECT user_id, name, email, fav_genre, profile_picture, bio, joined_date FROM Users WHERE user_id = ?',
    [userId]
  );

  const user = users[0];
  const token = generateToken({ userId: user.user_id, isAdmin: false });

  return { user, token };
}

async function loginUser({ email, password }) {
  // Fetch user
  const [users] = await pool.query(
    'SELECT user_id, name, email, password, fav_genre, profile_picture, bio, joined_date, is_active FROM Users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = users[0];

  if (!user.is_active) {
    throw new Error('Account is inactive');
  }

  // Compare password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last_login
  await pool.query('UPDATE Users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

  // Remove password from response
  delete user.password;

  const token = generateToken({ userId: user.user_id, isAdmin: false });

  return { user, token };
}

async function loginAdmin({ email, password }) {
  // Fetch admin
  const [admins] = await pool.query(
    'SELECT admin_id, name, email, password, role, is_super_admin FROM Admin WHERE email = ?',
    [email]
  );

  if (admins.length === 0) {
    throw new Error('Invalid email or password');
  }

  const admin = admins[0];

  // For now, compare plaintext (you should hash admin passwords too in production)
  // TODO: Hash admin passwords during seed and use bcrypt here
  if (admin.password !== password) {
    throw new Error('Invalid email or password');
  }

  // Remove password from response
  delete admin.password;

  const token = generateToken({ adminId: admin.admin_id, isAdmin: true, isSuperAdmin: admin.is_super_admin });

  return { admin, token };
}

async function getUserById(userId) {
  const [users] = await pool.query(
    'SELECT user_id, name, email, fav_genre, profile_picture, bio, joined_date, is_active FROM Users WHERE user_id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  return users[0];
}

/**
 * Generate password reset token and send email
 */
async function requestPasswordReset(email) {
  // Check if user exists
  const [users] = await pool.query(
    'SELECT user_id, name, email, is_active FROM Users WHERE email = ?',
    [email]
  );

  if (users.length === 0) {
    // Don't reveal if email exists - security best practice
    return { message: 'If that email exists, a reset link has been sent.' };
  }

  const user = users[0];

  if (!user.is_active) {
    throw new Error('Account is inactive. Please contact support.');
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token for storage (extra security)
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expiry to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this user
  await pool.query('DELETE FROM Password_Reset_Token WHERE user_id = ?', [user.user_id]);

  // Insert new token
  await pool.query(
    'INSERT INTO Password_Reset_Token (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.user_id, hashedToken, expiresAt]
  );

  // Send email with unhashed token (this is what user receives in URL)
  await sendPasswordResetEmail(user.email, resetToken, user.name);

  return { message: 'If that email exists, a reset link has been sent.' };
}

/**
 * Reset password using token
 */
async function resetPassword(token, newPassword) {
  // Hash the token to match stored version
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find valid token
  const [tokens] = await pool.query(
    `SELECT prt.token_id, prt.user_id, prt.expires_at, prt.used, u.email, u.name
     FROM Password_Reset_Token prt
     JOIN Users u ON prt.user_id = u.user_id
     WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()`,
    [hashedToken]
  );

  if (tokens.length === 0) {
    throw new Error('Invalid or expired reset token');
  }

  const tokenData = tokens[0];

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, tokenData.user_id]);

  // Mark token as used
  await pool.query('UPDATE Password_Reset_Token SET used = TRUE WHERE token_id = ?', [tokenData.token_id]);

  return { message: 'Password reset successful. You can now login with your new password.' };
}

/**
 * Validate reset token (check if valid before showing reset form)
 */
async function validateResetToken(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const [tokens] = await pool.query(
    `SELECT token_id, expires_at, used FROM Password_Reset_Token
     WHERE token = ? AND used = FALSE AND expires_at > NOW()`,
    [hashedToken]
  );

  if (tokens.length === 0) {
    return { valid: false, message: 'Invalid or expired reset token' };
  }

  return { valid: true, message: 'Token is valid' };
}

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getUserById,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
};
