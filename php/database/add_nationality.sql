-- Migration: Add nationality field to patients table

ALTER TABLE patients
ADD COLUMN nationality VARCHAR(100) NULL AFTER country;

-- Add index for search
CREATE INDEX idx_nationality ON patients (nationality);
