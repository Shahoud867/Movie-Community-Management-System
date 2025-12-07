-- Fix participant count inconsistencies
-- This script recalculates the current_participants count for all events
-- based on actual Participation table records

UPDATE Event e
SET current_participants = (
    SELECT COUNT(*)
    FROM Participation p
    WHERE p.event_id = e.event_id
);

-- Verify the results
SELECT 
    e.event_id,
    e.title,
    e.current_participants AS stored_count,
    COUNT(p.participation_id) AS actual_count,
    CASE 
        WHEN e.current_participants = COUNT(p.participation_id) THEN 'OK'
        ELSE 'MISMATCH'
    END AS status
FROM Event e
LEFT JOIN Participation p ON e.event_id = p.event_id
GROUP BY e.event_id, e.title, e.current_participants
ORDER BY status DESC, e.event_id;
