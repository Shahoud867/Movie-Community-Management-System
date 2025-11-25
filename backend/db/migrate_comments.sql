-- Migration script to update Comment table schema
-- This makes post_id and review_id nullable so comments can be on either posts OR reviews

USE movie_community;

-- Drop existing foreign key constraints
ALTER TABLE Comment DROP FOREIGN KEY Comment_ibfk_1;
ALTER TABLE Comment DROP FOREIGN KEY Comment_ibfk_3;

-- Modify columns to be nullable
ALTER TABLE Comment 
  MODIFY COLUMN post_id INT NULL,
  MODIFY COLUMN review_id INT NULL;

-- Add constraint to ensure at least one is set
ALTER TABLE Comment 
  ADD CONSTRAINT chk_comment_target CHECK (post_id IS NOT NULL OR review_id IS NOT NULL);

-- Add missing index for review_id
ALTER TABLE Comment 
  ADD INDEX idx_comment_review (review_id);

-- Re-add foreign key constraints
ALTER TABLE Comment 
  ADD CONSTRAINT Comment_ibfk_1 FOREIGN KEY (post_id) REFERENCES Post(post_id) ON DELETE CASCADE,
  ADD CONSTRAINT Comment_ibfk_3 FOREIGN KEY (review_id) REFERENCES Review(review_id) ON DELETE CASCADE;
