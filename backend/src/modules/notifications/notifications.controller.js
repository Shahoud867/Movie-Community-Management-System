const {
  getUserNotifications,
  markAsSeen,
  markAllAsSeen,
  deleteNotification,
  getUnreadCount,
} = require('./notifications.service');

/**
 * Get user's notifications
 * Query params: unread (boolean) - filter for unread only
 */
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.user_id;
    const unreadOnly = req.query.unread === 'true';

    const notifications = await getUserNotifications(userId, unreadOnly);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

/**
 * Get unread notification count
 */
async function getUnreadNotificationCount(req, res, next) {
  try {
    const userId = req.user.user_id;
    const result = await getUnreadCount(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Mark a notification as seen
 */
async function markNotificationAsSeen(req, res, next) {
  try {
    const userId = req.user.user_id;
    const notificationId = parseInt(req.params.id);

    if (!notificationId) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const result = await markAsSeen(notificationId, userId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Notification not found or access denied') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

/**
 * Mark all notifications as seen
 */
async function markAllNotificationsAsSeen(req, res, next) {
  try {
    const userId = req.user.user_id;
    const result = await markAllAsSeen(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a notification
 */
async function removeNotification(req, res, next) {
  try {
    const userId = req.user.user_id;
    const notificationId = parseInt(req.params.id);

    if (!notificationId) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const result = await deleteNotification(notificationId, userId);
    res.json(result);
  } catch (err) {
    if (err.message === 'Notification not found or access denied') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  removeNotification,
};
