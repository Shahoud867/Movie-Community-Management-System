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

/**
 * Search users by name or email
 */
async function searchUsers(query, currentUserId, limit = 20) {
  const searchPattern = `%${query}%`;
  
  const [users] = await pool.query(
    `SELECT 
      u.user_id,
      u.name,
      u.email,
      u.profile_picture,
      u.bio,
      u.fav_genre,
      u.joined_date,
      CASE 
        WHEN f.friendship_id IS NOT NULL AND f.status = 'accepted' THEN 'friend'
        WHEN f.friendship_id IS NOT NULL AND f.status = 'pending' AND f.sender_id = ? THEN 'request_sent'
        WHEN f.friendship_id IS NOT NULL AND f.status = 'pending' AND f.receiver_id = ? THEN 'request_received'
        ELSE 'none'
      END as friendship_status
    FROM Users u
    LEFT JOIN Friendship f ON 
      (f.sender_id = ? AND f.receiver_id = u.user_id) OR
      (f.receiver_id = ? AND f.sender_id = u.user_id)
    WHERE (u.name LIKE ? OR u.email LIKE ?)
      AND u.user_id != ?
      AND u.is_active = 1
    ORDER BY u.name ASC
    LIMIT ?`,
    [currentUserId, currentUserId, currentUserId, currentUserId, searchPattern, searchPattern, currentUserId, limit]
  );

  return users;
}

/**
 * Browse all users with pagination
 */
async function browseUsers(currentUserId, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  const [users] = await pool.query(
    `SELECT 
      u.user_id,
      u.name,
      u.email,
      u.profile_picture,
      u.bio,
      u.fav_genre,
      u.joined_date,
      CASE 
        WHEN f.friendship_id IS NOT NULL AND f.status = 'accepted' THEN 'friend'
        WHEN f.friendship_id IS NOT NULL AND f.status = 'pending' AND f.sender_id = ? THEN 'request_sent'
        WHEN f.friendship_id IS NOT NULL AND f.status = 'pending' AND f.receiver_id = ? THEN 'request_received'
        ELSE 'none'
      END as friendship_status
    FROM Users u
    LEFT JOIN Friendship f ON 
      (f.sender_id = ? AND f.receiver_id = u.user_id) OR
      (f.receiver_id = ? AND f.sender_id = u.user_id)
    WHERE u.user_id != ?
      AND u.is_active = 1
    ORDER BY u.joined_date DESC
    LIMIT ? OFFSET ?`,
    [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, limit, offset]
  );

  // Get total count for pagination
  const [countResult] = await pool.query(
    'SELECT COUNT(*) as total FROM Users WHERE user_id != ? AND is_active = 1',
    [currentUserId]
  );

  return {
    users,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit)
    }
  };
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateUserEmail,
  searchUsers,
  browseUsers,
};
