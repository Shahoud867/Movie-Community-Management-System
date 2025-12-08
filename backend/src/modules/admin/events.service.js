const { pool } = require('../../config/db');

// Get all events with host and movie details
async function getAllEvents() {
  const query = `
    SELECT 
      e.event_id, e.title, e.description, e.event_datetime, 
      e.capacity, e.current_participants, e.status,
      u.name as host_name, u.user_id as host_id,
      m.title as movie_title, m.movie_id
    FROM Event e
    LEFT JOIN Users u ON e.host_id = u.user_id
    LEFT JOIN Movie m ON e.movie_id = m.movie_id
    ORDER BY e.event_datetime DESC
  `;
  
  const [events] = await pool.query(query);
  return events;
}

// Get event by ID with participants
async function getEventById(eventId) {
  const eventQuery = `
    SELECT 
      e.event_id, e.title, e.description, e.event_datetime, 
      e.capacity, e.current_participants, e.status, e.created_date,
      u.name as host_name, u.user_id as host_id, u.email as host_email,
      m.title as movie_title, m.movie_id, m.poster
    FROM Event e
    LEFT JOIN Users u ON e.host_id = u.user_id
    LEFT JOIN Movie m ON e.movie_id = m.movie_id
    WHERE e.event_id = ?
  `;
  
  const participantsQuery = `
    SELECT 
      p.participation_id, p.attendance_status, p.joined_date,
      u.user_id, u.name, u.email
    FROM Participation p
    JOIN Users u ON p.user_id = u.user_id
    WHERE p.event_id = ?
    ORDER BY p.joined_date DESC
  `;
  
  const [events] = await pool.query(eventQuery, [eventId]);
  if (events.length === 0) return null;
  
  const [participants] = await pool.query(participantsQuery, [eventId]);
  
  return {
    ...events[0],
    participants
  };
}

// Get event statistics
async function getEventStats() {
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'scheduled' AND event_datetime > NOW() THEN 1 ELSE 0 END) as upcoming,
      SUM(current_participants) as total_participants,
      AVG(CASE WHEN capacity > 0 THEN (current_participants / capacity * 100) ELSE 0 END) as avg_attendance
    FROM Event
  `;
  
  const [stats] = await pool.query(statsQuery);
  return stats[0];
}

// Update event status
async function updateEventStatus(eventId, status) {
  const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }
  
  const query = 'UPDATE Event SET status = ? WHERE event_id = ?';
  const [result] = await pool.query(query, [status, eventId]);
  
  if (result.affectedRows === 0) {
    throw new Error('Event not found');
  }
  
  return { message: 'Event status updated successfully' };
}

// Delete event
async function deleteEvent(eventId) {
  // Participants will be deleted automatically due to CASCADE
  const query = 'DELETE FROM Event WHERE event_id = ?';
  const [result] = await pool.query(query, [eventId]);
  
  if (result.affectedRows === 0) {
    throw new Error('Event not found');
  }
  
  return { message: 'Event deleted successfully' };
}

module.exports = {
  getAllEvents,
  getEventById,
  getEventStats,
  updateEventStatus,
  deleteEvent
};
