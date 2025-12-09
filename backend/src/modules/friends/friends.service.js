const { pool } = require('../../config/db');

/**
 * Helper to normalize friendship IDs (ensure sender_id < receiver_id)
 */
function normalizeFriendshipIds(userId1, userId2) {
  return userId1 < userId2
    ? { senderId: userId1, receiverId: userId2 }
    : { senderId: userId2, receiverId: userId1 };
}

/**
 * Get all accepted friends for a user
 */
async function getFriends(userId) {
  const [friends] = await pool.query(
    `SELECT 
      f.friendship_id,
      CASE 
        WHEN f.sender_id = ? THEN f.receiver_id 
        ELSE f.sender_id 
      END as user_id,
      CASE 
        WHEN f.sender_id = ? THEN u2.name 
        ELSE u1.name 
      END as name,
      CASE 
        WHEN f.sender_id = ? THEN u2.email 
        ELSE u1.email 
      END as email,
      CASE 
        WHEN f.sender_id = ? THEN u2.profile_picture 
        ELSE u1.profile_picture 
      END as profile_picture,
      CASE 
        WHEN f.sender_id = ? THEN u2.bio 
        ELSE u1.bio 
      END as bio,
      f.response_date as friends_since
    FROM Friendship f
    JOIN Users u1 ON f.sender_id = u1.user_id
    JOIN Users u2 ON f.receiver_id = u2.user_id
    WHERE (f.sender_id = ? OR f.receiver_id = ?) 
      AND f.status = 'accepted'
    ORDER BY f.response_date DESC`,
    [userId, userId, userId, userId, userId, userId, userId]
  );

  return friends;
}

/**
 * Get all pending friend requests (received by this user)
 */
async function getPendingRequests(userId) {
  const [requests] = await pool.query(
    `SELECT 
      f.friendship_id,
      f.sender_id,
      u.name as sender_name,
      u.email as sender_email,
      u.profile_picture as sender_profile_picture,
      u.bio as sender_bio,
      f.request_date as created_date
    FROM Friendship f
    JOIN Users u ON f.sender_id = u.user_id
    WHERE f.receiver_id = ? AND f.status = 'pending'
    ORDER BY f.request_date DESC`,
    [userId]
  );

  return requests;
}

/**
 * Get friendship status between two users
 */
async function getFriendshipStatus(userId1, userId2) {
  if (userId1 === userId2) {
    return { status: 'self' };
  }

  // Check both directions since we're not normalizing anymore
  const [rows] = await pool.query(
    `SELECT status, sender_id, receiver_id 
     FROM Friendship 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)`,
    [userId1, userId2, userId2, userId1]
  );

  if (rows.length === 0) {
    return { status: 'none' };
  }

  return { status: rows[0].status, sender_id: rows[0].sender_id, receiver_id: rows[0].receiver_id };
}

/**
 * Send a friend request
 */
async function sendFriendRequest(senderId, receiverId) {
  // Prevent self-friending
  if (senderId === receiverId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if receiver exists
  const [users] = await pool.query(
    'SELECT user_id FROM Users WHERE user_id = ? AND is_active = TRUE',
    [receiverId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  // Check if friendship already exists in EITHER direction
  const [existing] = await pool.query(
    `SELECT friendship_id, status, sender_id, receiver_id 
     FROM Friendship 
     WHERE (sender_id = ? AND receiver_id = ?) 
        OR (sender_id = ? AND receiver_id = ?)`,
    [senderId, receiverId, receiverId, senderId]
  );

  if (existing.length > 0) {
    if (existing[0].status === 'accepted') {
      throw new Error('Already friends');
    } else if (existing[0].status === 'pending') {
      throw new Error('Friend request already pending');
    } else if (existing[0].status === 'declined') {
      // Update declined request to pending - keep original sender/receiver
      await pool.query(
        'UPDATE Friendship SET status = \'pending\', request_date = CURRENT_TIMESTAMP, response_date = NULL WHERE friendship_id = ?',
        [existing[0].friendship_id]
      );
      return { message: 'Friend request sent', friendship_id: existing[0].friendship_id };
    }
  }

  // Insert new friendship request with actual sender and receiver (no normalization)
  const [result] = await pool.query(
    'INSERT INTO Friendship (sender_id, receiver_id, status) VALUES (?, ?, \'pending\')',
    [senderId, receiverId]
  );

  return { message: 'Friend request sent', friendship_id: result.insertId };
}

/**
 * Respond to a friend request (accept/decline) using stored procedure
 */
async function respondToFriendRequest(userId, friendshipId, action) {
  if (!['accept', 'decline'].includes(action)) {
    throw new Error('Invalid action. Must be "accept" or "decline"');
  }

  // Get friendship and verify user is the receiver
  const [friendships] = await pool.query(
    'SELECT sender_id, receiver_id, status FROM Friendship WHERE friendship_id = ?',
    [friendshipId]
  );

  if (friendships.length === 0) {
    throw new Error('Friend request not found');
  }

  const friendship = friendships[0];

  // Verify user is the receiver (not the sender)
  if (friendship.receiver_id !== userId) {
    throw new Error('You cannot respond to this friend request');
  }

  if (friendship.status !== 'pending') {
    throw new Error('Friend request is not pending');
  }

  // Use stored procedure - automatically creates notification on accept
  try {
    await pool.query('CALL sp_process_friend_request(?, ?)', [friendshipId, action]);
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    return { message: `Friend request ${action}ed`, status: newStatus };
  } catch (error) {
    // Fallback to manual update if procedure doesn't exist
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await pool.query(
      'UPDATE Friendship SET status = ?, response_date = CURRENT_TIMESTAMP WHERE friendship_id = ?',
      [newStatus, friendshipId]
    );
    return { message: `Friend request ${action}ed`, status: newStatus };
  }
}

/**
 * Remove a friend (delete friendship)
 */
async function removeFriend(userId, friendId) {
  if (userId === friendId) {
    throw new Error('Invalid operation');
  }

  const { senderId, receiverId } = normalizeFriendshipIds(userId, friendId);

  const [result] = await pool.query(
    'DELETE FROM Friendship WHERE sender_id = ? AND receiver_id = ? AND status = \'accepted\'',
    [senderId, receiverId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Friendship not found or not accepted');
  }

  return { message: 'Friend removed successfully' };
}

module.exports = {
  getFriends,
  getPendingRequests,
  getFriendshipStatus,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
};
