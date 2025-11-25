const express = require('express');
const {
  listConversations,
  getMessages,
  send,
  markRead,
  markConversationRead,
} = require('./messages.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// All message routes require authentication
router.get('/conversations', authenticate, listConversations);
router.get('/', authenticate, getMessages);
router.post('/', authenticate, send);
router.put('/:id/read', authenticate, markRead);
router.post('/mark-read', authenticate, markConversationRead);

module.exports = { messagesRouter: router };
