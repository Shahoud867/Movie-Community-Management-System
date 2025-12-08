const { pool } = require('../../config/db');

/**
 * Get all events with optional filters
 */
async function getEvents({ status = 'scheduled', upcoming = true, limit = 50 }) {
  let query = `
    SELECT 
      e.event_id,
      e.title,
      e.description,
      e.host_id,
      e.movie_id,
      e.event_datetime,
      e.capacity,
      e.current_participants,
      e.status,
      e.created_date,
      m.title as movie_title,
      m.poster as movie_poster,
      m.release_year,
      u.name as host_name,
      u.email as host_email,
      u.profile_picture as host_profile_picture
    FROM Event e
    INNER JOIN Movie m ON e.movie_id = m.movie_id
    INNER JOIN Users u ON e.host_id = u.user_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ` AND e.status = ?`;
    params.push(status);
  }
  
  if (upcoming) {
    query += ` AND e.event_datetime > NOW()`;
  }
  
  query += ` ORDER BY e.event_datetime ASC LIMIT ?`;
  params.push(parseInt(limit));
  
  const [events] = await pool.query(query, params);
  return events;
}

/**
 * Get event by ID
 */
async function getEventById(eventId) {
  const [events] = await pool.query(
    `SELECT 
      e.event_id,
      e.title,
      e.description,
      e.host_id,
      e.movie_id,
      e.event_datetime,
      e.capacity,
      e.current_participants,
      e.status,
      e.created_date,
      m.title as movie_title,
      m.poster as movie_poster,
      m.synopsis as movie_synopsis,
      m.release_year,
      m.director,
      u.name as host_name,
      u.email as host_email,
      u.profile_picture as host_profile_picture,
      u.bio as host_bio
    FROM Event e
    INNER JOIN Movie m ON e.movie_id = m.movie_id
    INNER JOIN Users u ON e.host_id = u.user_id
    WHERE e.event_id = ?`,
    [eventId]
  );
  
  if (events.length === 0) {
    throw new Error('Event not found');
  }
  
  return events[0];
}

/**
 * Create a new event
 */
async function createEvent(hostId, { title, description, movie_id, event_datetime, capacity = 50 }) {
  // Validate event is in the future
  const eventDate = new Date(event_datetime);
  if (eventDate <= new Date()) {
    throw new Error('Event must be scheduled for a future date and time');
  }
  
  const [result] = await pool.query(
    `INSERT INTO Event (title, description, host_id, movie_id, event_datetime, capacity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, description, hostId, movie_id, event_datetime, capacity]
  );
  
  return {
    event_id: result.insertId,
    title,
    description,
    host_id: hostId,
    movie_id,
    event_datetime,
    capacity,
    current_participants: 0,
    status: 'scheduled',
    message: 'Event created successfully'
  };
}

/**
 * Update event
 */
async function updateEvent(eventId, hostId, updates) {
  // Verify ownership
  const [event] = await pool.query(
    'SELECT host_id, status FROM Event WHERE event_id = ?',
    [eventId]
  );
  
  if (event.length === 0) {
    throw new Error('Event not found');
  }
  
  if (event[0].host_id !== hostId) {
    throw new Error('You do not have permission to update this event');
  }
  
  if (event[0].status === 'completed' || event[0].status === 'cancelled') {
    throw new Error('Cannot update a completed or cancelled event');
  }
  
  const fields = [];
  const values = [];
  
  if (updates.title) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  
  if (updates.event_datetime) {
    const eventDate = new Date(updates.event_datetime);
    if (eventDate <= new Date()) {
      throw new Error('Event must be scheduled for a future date and time');
    }
    fields.push('event_datetime = ?');
    values.push(updates.event_datetime);
  }
  
  if (updates.capacity) {
    fields.push('capacity = ?');
    values.push(updates.capacity);
  }
  
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  
  if (fields.length === 0) {
    throw new Error('No fields to update');
  }
  
  values.push(eventId);
  
  await pool.query(
    `UPDATE Event SET ${fields.join(', ')} WHERE event_id = ?`,
    values
  );
  
  return { message: 'Event updated successfully' };
}

/**
 * Delete event
 */
async function deleteEvent(eventId, hostId) {
  const [result] = await pool.query(
    'DELETE FROM Event WHERE event_id = ? AND host_id = ?',
    [eventId, hostId]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Event not found or you do not have permission to delete it');
  }
  
  return { message: 'Event deleted successfully' };
}

/**
 * Join an event
 */
async function joinEvent(eventId, userId) {
  // Check if event exists and has capacity
  const [events] = await pool.query(
    `SELECT event_id, event_datetime, capacity, current_participants, status, host_id 
     FROM Event WHERE event_id = ?`,
    [eventId]
  );
  
  if (events.length === 0) {
    throw new Error('Event not found');
  }
  
  const event = events[0];
  
  if (event.status !== 'scheduled') {
    throw new Error('Cannot join this event. Event status: ' + event.status);
  }
  
  if (new Date(event.event_datetime) <= new Date()) {
    throw new Error('Cannot join a past event');
  }
  
  if (event.current_participants >= event.capacity) {
    throw new Error('Event is at full capacity');
  }
  
  // Check if user is the host
  if (event.host_id === userId) {
    throw new Error('You are the host of this event');
  }
  
  // Check if user already joined
  const [existing] = await pool.query(
    'SELECT participation_id FROM Participation WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  
  if (existing.length > 0) {
    throw new Error('You have already joined this event');
  }
  
  // Check for conflicting events at the same datetime
  const [conflicts] = await pool.query(
    `SELECT p.participation_id FROM Participation p
     JOIN Event e ON p.event_id = e.event_id
     WHERE p.user_id = ? AND e.event_datetime = ?`,
    [userId, event.event_datetime]
  );
  
  if (conflicts.length > 0) {
    throw new Error('You have already joined another event at this time');
  }
  
  // Add participation
  const [result] = await pool.query(
    'INSERT INTO Participation (event_id, user_id) VALUES (?, ?)',
    [eventId, userId]
  );
  
  // Trigger trg_participation_insert will automatically increment current_participants
  
  return { message: 'Successfully joined the event' };
}

/**
 * Leave an event
 */
async function leaveEvent(eventId, userId) {
  const [result] = await pool.query(
    'DELETE FROM Participation WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('You are not registered for this event');
  }
  
  // Trigger trg_participation_delete will automatically decrement current_participants
  
  return { message: 'Successfully left the event' };
}

/**
 * Get event participants
 */
async function getEventParticipants(eventId) {
  const [participants] = await pool.query(
    `SELECT 
      p.participation_id,
      p.user_id,
      p.joined_date,
      p.attendance_status,
      u.name,
      u.email,
      u.profile_picture
    FROM Participation p
    INNER JOIN Users u ON p.user_id = u.user_id
    WHERE p.event_id = ?
    ORDER BY p.joined_date ASC`,
    [eventId]
  );
  
  return participants;
}

/**
 * Get user's participated events
 */
async function getUserEvents(userId, { upcoming = true } = {}) {
  let query = `
    SELECT 
      e.event_id,
      e.title,
      e.description,
      e.event_datetime,
      e.capacity,
      e.current_participants,
      e.status,
      e.host_id,
      m.title as movie_title,
      m.poster as movie_poster,
      u.name as host_name,
      p.joined_date,
      p.attendance_status
    FROM Participation p
    INNER JOIN Event e ON p.event_id = e.event_id
    INNER JOIN Movie m ON e.movie_id = m.movie_id
    INNER JOIN Users u ON e.host_id = u.user_id
    WHERE p.user_id = ?
  `;
  
  const params = [userId];
  
  if (upcoming) {
    query += ` AND e.event_datetime > NOW()`;
  }
  
  query += ` ORDER BY e.event_datetime ASC`;
  
  const [events] = await pool.query(query, params);
  return events;
}

/**
 * Check if user has joined event
 */
async function hasUserJoinedEvent(eventId, userId) {
  const [result] = await pool.query(
    'SELECT participation_id FROM Participation WHERE event_id = ? AND user_id = ?',
    [eventId, userId]
  );
  
  return result.length > 0;
}

module.exports = {
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
};
