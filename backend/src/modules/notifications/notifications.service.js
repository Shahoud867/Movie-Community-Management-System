const { pool } = require('../../config/db');

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId, unreadOnly = false) {
  let query = `
    SELECT 
      n.notification_id,
      n.recipient_id,
      n.sender_id,
      n.notification_type,
      n.reference_id,
      n.message,
      n.created_date,
      n.is_seen,
      n.seen_date,
      u.name as sender_name,
      u.profile_picture as sender_picture
    FROM Notification n
    LEFT JOIN Users u ON n.sender_id = u.user_id
    WHERE n.recipient_id = ?
  `;

  const params = [userId];

  if (unreadOnly) {
    query += ` AND n.is_seen = 0`;
  }

  query += ` ORDER BY n.created_date DESC`;

  const [notifications] = await pool.query(query, params);
  return notifications;
}

/**
 * Mark notification as seen
 */
async function markAsSeen(notificationId, userId) {
  const [result] = await pool.query(
    `UPDATE Notification 
     SET is_seen = 1, seen_date = NOW() 
     WHERE notification_id = ? AND recipient_id = ?`,
    [notificationId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Notification not found or access denied');
  }

  return { notification_id: notificationId, is_seen: true };
}

/**
 * Mark all notifications as seen for a user
 */
async function markAllAsSeen(userId) {
  const [result] = await pool.query(
    `UPDATE Notification 
     SET is_seen = 1, seen_date = NOW() 
     WHERE recipient_id = ? AND is_seen = 0`,
    [userId]
  );

  return { marked_count: result.affectedRows };
}

/**
 * Create a new notification
 */
async function createNotification(data) {
  const { recipient_id, sender_id, notification_type, reference_id, message } = data;

  const [result] = await pool.query(
    `INSERT INTO Notification (recipient_id, sender_id, notification_type, reference_id, message) 
     VALUES (?, ?, ?, ?, ?)`,
    [recipient_id, sender_id || null, notification_type, reference_id || null, message]
  );

  return {
    notification_id: result.insertId,
    recipient_id,
    sender_id,
    notification_type,
    reference_id,
    message,
    is_seen: false,
  };
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationId, userId) {
  const [result] = await pool.query(
    `DELETE FROM Notification 
     WHERE notification_id = ? AND recipient_id = ?`,
    [notificationId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error('Notification not found or access denied');
  }

  return { notification_id: notificationId };
}

/**
 * Get unread notification count
 */
async function getUnreadCount(userId) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count 
     FROM Notification 
     WHERE recipient_id = ? AND is_seen = 0`,
    [userId]
  );

  return { unread_count: rows[0].count };
}

/**
 * Delete notifications older than 24 hours
 * This function is called periodically to cleanup old notifications
 */
async function cleanupOldNotifications() {
  const [result] = await pool.query(
    `DELETE FROM Notification 
     WHERE created_date < DATE_SUB(NOW(), INTERVAL 24 HOUR)`
  );

  return { deleted_count: result.affectedRows };
}

/**
 * Start the notification cleanup scheduler
 * Runs every hour to remove notifications older than 24 hours
 */
function startCleanupScheduler() {
  // Run cleanup immediately on startup
  cleanupOldNotifications()
    .then(result => {
      if (result.deleted_count > 0) {
        console.log(`[Notification Cleanup] Removed ${result.deleted_count} old notifications`);
      }
    })
    .catch(err => {
      console.error('[Notification Cleanup] Error:', err.message);
    });

  // Schedule cleanup to run every hour (3600000 ms)
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
  
  setInterval(async () => {
    try {
      const result = await cleanupOldNotifications();
      if (result.deleted_count > 0) {
        console.log(`[Notification Cleanup] Removed ${result.deleted_count} old notifications`);
      }
    } catch (err) {
      console.error('[Notification Cleanup] Error:', err.message);
    }
  }, CLEANUP_INTERVAL);

  console.log('[Notification Cleanup] Scheduler started - runs every hour');
}

module.exports = {
  getUserNotifications,
  markAsSeen,
  markAllAsSeen,
  createNotification,
  deleteNotification,
  getUnreadCount,
  cleanupOldNotifications,
  startCleanupScheduler,
};
