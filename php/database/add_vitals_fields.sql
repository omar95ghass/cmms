-- Migration: Add new fields to vitals table
-- Add pulse, BMI, respiration rate, visual tests, and systems examination

ALTER TABLE vitals
ADD COLUMN pulse INT NULL AFTER temperature,
ADD COLUMN bmi DECIMAL(4,2) NULL AFTER pulse,
ADD COLUMN respiration_rate INT NULL AFTER bmi,
ADD COLUMN visual_tests JSON NULL AFTER respiration_rate,
ADD COLUMN systems_examination JSON NULL AFTER visual_tests;

-- Add index for pulse if needed
CREATE INDEX idx_pulse ON vitals (pulse);
