const express = require('express');
const {
  listFriends,
  listRequests,
  checkStatus,
  sendRequest,
  respond,
  remove,
} = require('./friends.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// All friendship routes require authentication
router.get('/', authenticate, listFriends);
router.get('/requests', authenticate, listRequests);
router.get('/status', authenticate, checkStatus);
router.post('/request', authenticate, sendRequest);
router.post('/respond', authenticate, respond);
router.delete('/remove', authenticate, remove);

module.exports = { friendsRouter: router };
