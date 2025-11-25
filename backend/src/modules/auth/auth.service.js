const { pool } = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');

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

module.exports = { registerUser, loginUser, loginAdmin, getUserById };
