const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventParticipants,
  getUserEvents,
  hasUserJoinedEvent,
} = require('./events.service');

async function listEvents(req, res, next) {
  try {
    const { status, upcoming, limit } = req.query;
    const events = await getEvents({
      status,
      upcoming: upcoming !== 'false',
      limit: limit || 50,
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const event = await getEventById(eventId);
    
    // Check if current user has joined
    if (req.user) {
      const hasJoined = await hasUserJoinedEvent(eventId, req.user.user_id);
      event.user_has_joined = hasJoined;
      event.is_host = event.host_id === req.user.user_id;
    }
    
    res.json(event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function createNewEvent(req, res, next) {
  try {
    const { title, description, movie_id, event_datetime, capacity } = req.body;
    
    if (!title || !movie_id || !event_datetime) {
      return res.status(400).json({ error: 'Title, movie ID, and event datetime are required' });
    }
    
    const result = await createEvent(req.user.user_id, {
      title,
      description,
      movie_id,
      event_datetime,
      capacity,
    });
    
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('future date')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function editEvent(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await updateEvent(eventId, req.user.user_id, req.body);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('permission')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('Cannot update')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function removeEvent(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await deleteEvent(eventId, req.user.user_id);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('permission')) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

async function joinEventHandler(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await joinEvent(eventId, req.user.user_id);
    res.json(result);
  } catch (err) {
    console.error('Join event error:', err);
    if (err.message.includes('not found') || err.message.includes('full capacity') || 
        err.message.includes('already joined') || err.message.includes('Cannot join') ||
        err.message.includes('host of this event') || err.message.includes('another event')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function leaveEventHandler(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const result = await leaveEvent(eventId, req.user.user_id);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not registered')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

async function listParticipants(req, res, next) {
  try {
    const eventId = parseInt(req.params.id);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const participants = await getEventParticipants(eventId);
    res.json(participants);
  } catch (err) {
    next(err);
  }
}

async function listUserEvents(req, res, next) {
  try {
    const { upcoming } = req.query;
    const events = await getUserEvents(req.user.user_id, {
      upcoming: upcoming !== 'false',
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEvents,
  getEvent,
  createNewEvent,
  editEvent,
  removeEvent,
  joinEventHandler,
  leaveEventHandler,
  listParticipants,
  listUserEvents,
};
