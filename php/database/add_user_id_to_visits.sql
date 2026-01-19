-- Migration: Add user_id column to visits table
-- This migration adds the user_id column to track which doctor created each visit

ALTER TABLE visits 
ADD COLUMN user_id INT NULL AFTER treatment_plan,
ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_user_id (user_id);

-- Update existing visits: Try to find the user from activity_logs
UPDATE visits v
LEFT JOIN activity_logs al ON al.entity_type = 'visit' AND al.entity_id = v.id AND al.action = 'create'
SET v.user_id = al.user_id
WHERE v.user_id IS NULL;
