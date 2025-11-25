const express = require('express');
const {
  listEvents,
  getEvent,
  createNewEvent,
  editEvent,
  removeEvent,
  joinEventHandler,
  leaveEventHandler,
  listParticipants,
  listUserEvents,
} = require('./events.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', listEvents);
router.get('/:id', getEvent);
router.get('/:id/participants', listParticipants);

// Authenticated routes
router.post('/', authenticate, createNewEvent);
router.patch('/:id', authenticate, editEvent);
router.delete('/:id', authenticate, removeEvent);
router.post('/:id/join', authenticate, joinEventHandler);
router.post('/:id/leave', authenticate, leaveEventHandler);
router.get('/user/my-events', authenticate, listUserEvents);

module.exports = { eventsRouter: router };
