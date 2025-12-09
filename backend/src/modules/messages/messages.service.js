const { pool } = require('../../config/db');

/**
 * Helper to check if two users are friends
 */
async function areFriends(userId1, userId2) {
  // Check both directions since we removed normalization
  const [rows] = await pool.query(
    `SELECT status FROM Friendship 
     WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND status = 'accepted'`,
    [userId1, userId2, userId2, userId1]
  );

  return rows.length > 0;
}

/**
 * Get all conversations for a user (list of users they've messaged with)
 */
async function getConversations(userId) {
  const [conversations] = await pool.query(
    `SELECT 
       m1.partner_id AS user_id,
       u.name,
       u.profile_picture,
       MAX(m1.sent_date) AS last_message_date,
       (
         SELECT content FROM Message 
         WHERE (sender_id = ? AND receiver_id = m1.partner_id)
            OR (sender_id = m1.partner_id AND receiver_id = ?)
         ORDER BY sent_date DESC LIMIT 1
       ) AS last_message,
       SUM(CASE WHEN m1.receiver_id = ? 
                 AND m1.sender_id = m1.partner_id 
                 AND m1.read_status = FALSE 
                THEN 1 ELSE 0 END) AS unread_count
     FROM (
       SELECT 
         CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS partner_id,
         sent_date,
         sender_id,
         receiver_id,
         read_status
       FROM Message
       WHERE sender_id = ? OR receiver_id = ?
     ) m1
     JOIN Users u ON u.user_id = m1.partner_id
     GROUP BY m1.partner_id, u.name, u.profile_picture
     ORDER BY last_message_date DESC`,
    [userId, userId, userId, userId, userId, userId]
  );

  return conversations;
}

/**
 * Get all messages between two users
 */
async function getMessagesBetweenUsers(userId1, userId2) {
  const [messages] = await pool.query(
    `SELECT 
      message_id,
      sender_id,
      receiver_id,
      content,
      sent_date,
      read_status,
      read_date
    FROM Message
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY sent_date ASC`,
    [userId1, userId2, userId2, userId1]
  );

  return messages;
}

/**
 * Send a message to another user
 */
async function sendMessage(senderId, receiverId, content) {
  // Prevent self-messaging
  if (senderId === receiverId) {
    throw new Error('Cannot send message to yourself');
  }

  // Check if receiver exists
  const [users] = await pool.query(
    'SELECT user_id, name FROM Users WHERE user_id = ? AND is_active = TRUE',
    [receiverId]
  );

  if (users.length === 0) {
    throw new Error('User not found');
  }

  // Check if users are friends
  const friends = await areFriends(senderId, receiverId);
  if (!friends) {
    throw new Error('You can only send messages to friends');
  }

  // Validate content
  if (!content || content.trim().length === 0) {
    throw new Error('Message content cannot be empty');
  }

  // Get sender name for notification
  const [senders] = await pool.query(
    'SELECT name FROM Users WHERE user_id = ?',
    [senderId]
  );

  // Insert message
  const [result] = await pool.query(
    'INSERT INTO Message (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    [senderId, receiverId, content.trim()]
  );

  // Create notification for the receiver
  try {
    const senderName = senders[0]?.name || 'Someone';
    await pool.query(
      `INSERT INTO Notification (recipient_id, sender_id, notification_type, reference_id, message)
       VALUES (?, ?, 'message', ?, ?)`,
      [receiverId, senderId, result.insertId, `${senderName} sent you a message`]
    );
  } catch (notifError) {
    console.error('Failed to create message notification:', notifError);
    // Don't fail the message send if notification fails
  }

  // Return the created message
  const [messages] = await pool.query(
    'SELECT message_id, sender_id, receiver_id, content, sent_date, read_status, read_date FROM Message WHERE message_id = ?',
    [result.insertId]
  );

  return messages[0];
}

/**
 * Mark a message as read
 */
async function markMessageAsRead(messageId, userId) {
  // Verify user is the receiver of the message
  const [messages] = await pool.query(
    'SELECT receiver_id FROM Message WHERE message_id = ?',
    [messageId]
  );

  if (messages.length === 0) {
    throw new Error('Message not found');
  }

  if (messages[0].receiver_id !== userId) {
    throw new Error('You can only mark your own messages as read');
  }

  // Update message
  await pool.query(
    'UPDATE Message SET read_status = TRUE, read_date = CURRENT_TIMESTAMP WHERE message_id = ? AND read_status = FALSE',
    [messageId]
  );

  return { message: 'Message marked as read' };
}

/**
 * Mark all messages from a specific user as read
 */
async function markConversationAsRead(userId, otherUserId) {
  await pool.query(
    'UPDATE Message SET read_status = TRUE, read_date = CURRENT_TIMESTAMP WHERE sender_id = ? AND receiver_id = ? AND read_status = FALSE',
    [otherUserId, userId]
  );

  return { message: 'Conversation marked as read' };
}

module.exports = {
  getConversations,
  getMessagesBetweenUsers,
  sendMessage,
  markMessageAsRead,
  markConversationAsRead,
};
