-- Migration: Add father_name field to patients table

ALTER TABLE patients
ADD COLUMN father_name VARCHAR(100) NULL AFTER last_name;

-- Add index for search
CREATE INDEX idx_father_name ON patients (father_name);
