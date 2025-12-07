-- Database triggers to automatically maintain participant counts
-- This ensures current_participants always matches actual Participation records

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_participation_insert;
DROP TRIGGER IF EXISTS after_participation_delete;

-- Trigger to increment count when someone joins an event
DELIMITER $$

CREATE TRIGGER after_participation_insert
AFTER INSERT ON Participation
FOR EACH ROW
BEGIN
    UPDATE Event 
    SET current_participants = current_participants + 1
    WHERE event_id = NEW.event_id;
END$$

-- Trigger to decrement count when someone leaves an event
CREATE TRIGGER after_participation_delete
AFTER DELETE ON Participation
FOR EACH ROW
BEGIN
    UPDATE Event 
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE event_id = OLD.event_id;
END$$

DELIMITER ;

-- Verify triggers were created
SHOW TRIGGERS WHERE `Table` = 'Participation';
