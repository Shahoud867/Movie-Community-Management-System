const { pool } = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');

async function getUserProfile(userId) {
  const [users] = await pool.query(
    `SELECT user_id, name, email, fav_genre, profile_picture, bio, joined_date, last_login, is_active 
     FROM Users 
     WHERE user_id = ?`,
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  return users[0];
}

async function updateUserProfile(userId, { name, bio, fav_genre, profile_picture }) {
  const updates = [];
  const values = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (bio !== undefined) {
    updates.push('bio = ?');
    values.push(bio);
  }
  if (fav_genre !== undefined) {
    updates.push('fav_genre = ?');
    values.push(fav_genre);
  }
  if (profile_picture !== undefined) {
    updates.push('profile_picture = ?');
    values.push(profile_picture);
  }

  if (updates.length === 0) {
    throw new Error('No fields to update');
  }

  values.push(userId);

  await pool.query(
    `UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`,
    values
  );

  return getUserProfile(userId);
}

async function updateUserPassword(userId, { currentPassword, newPassword }) {
  // Fetch current password
  const [users] = await pool.query(
    'SELECT password FROM Users WHERE user_id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];

  // Verify current password
  const isValid = await comparePassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await pool.query(
    'UPDATE Users SET password = ? WHERE user_id = ?',
    [hashedPassword, userId]
  );

  return { message: 'Password updated successfully' };
}

async function updateUserEmail(userId, { password, newEmail }) {
  // Fetch current user
  const [users] = await pool.query(
    'SELECT password, email FROM Users WHERE user_id = ?',
    [userId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Password is incorrect');
  }

  // Check if new email already exists
  const [existing] = await pool.query(
    'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
    [newEmail, userId]
  );

  if (existing.length > 0) {
    throw new Error('Email already in use');
  }

  // Update email
  await pool.query(
    'UPDATE Users SET email = ? WHERE user_id = ?',
    [newEmail, userId]
  );

  return { message: 'Email updated successfully', email: newEmail };
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateUserEmail,
};
