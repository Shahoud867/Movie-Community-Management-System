const express = require('express');
const {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsSeen,
  markAllNotificationsAsSeen,
  removeNotification,
} = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadNotificationCount);
router.patch('/:id/seen', authenticate, markNotificationAsSeen);
router.patch('/mark-all-seen', authenticate, markAllNotificationsAsSeen);
router.delete('/:id', authenticate, removeNotification);

module.exports = { notificationsRouter: router };
