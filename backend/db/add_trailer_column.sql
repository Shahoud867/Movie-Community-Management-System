-- Add trailer_url column to Movie table for YouTube trailer embedding
-- This allows storing YouTube video IDs for each movie

ALTER TABLE Movie ADD COLUMN trailer_url VARCHAR(255) DEFAULT NULL COMMENT 'YouTube video ID or URL for movie trailer';

-- Verify the change
DESCRIBE Movie;
