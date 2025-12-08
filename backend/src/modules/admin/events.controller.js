const eventsService = require('./events.service');

// Get all events
async function getAllEvents(req, res, next) {
  try {
    const events = await eventsService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
}

// Get event by ID
async function getEventById(req, res, next) {
  try {
    const { id } = req.params;
    const event = await eventsService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    next(error);
  }
}

// Get event statistics
async function getEventStats(req, res, next) {
  try {
    const stats = await eventsService.getEventStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

// Update event status
async function updateEventStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const result = await eventsService.updateEventStatus(id, status);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// Delete event
async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const result = await eventsService.deleteEvent(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  getEventStats,
  updateEventStatus,
  deleteEvent
};
