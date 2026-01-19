-- Migration: Add new fields to patients table
-- Add marital status, country, city, and ID details

ALTER TABLE patients
ADD COLUMN marital_status ENUM('single', 'married', 'divorced', 'widowed') NULL AFTER gender,
ADD COLUMN profession VARCHAR(100) NULL AFTER marital_status,
ADD COLUMN country VARCHAR(100) NULL AFTER address,
ADD COLUMN city VARCHAR(100) NULL AFTER country,
ADD COLUMN id_mrz VARCHAR(50) NULL AFTER id_number,
ADD COLUMN id_passport_number VARCHAR(50) NULL AFTER id_mrz,
ADD COLUMN id_place_of_issue VARCHAR(100) NULL AFTER id_passport_number;

-- Add indexes for search
CREATE INDEX idx_country ON patients (country);
CREATE INDEX idx_city ON patients (city);
