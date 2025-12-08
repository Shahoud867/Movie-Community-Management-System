const express = require('express');
const router = express.Router();
const eventsController = require('./events.controller');
const { requireAdmin } = require('../../middleware/adminAuth');

// All routes require admin authentication
router.use(requireAdmin);

// GET /api/admin/events - Get all events
router.get('/', eventsController.getAllEvents);

// GET /api/admin/events/stats - Get event statistics
router.get('/stats', eventsController.getEventStats);

// GET /api/admin/events/:id - Get event by ID with participants
router.get('/:id', eventsController.getEventById);

// PUT /api/admin/events/:id/status - Update event status
router.put('/:id/status', eventsController.updateEventStatus);

// DELETE /api/admin/events/:id - Delete event
router.delete('/:id', eventsController.deleteEvent);

module.exports = router;
