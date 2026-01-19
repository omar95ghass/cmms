-- Medical Management System Database Schema

CREATE DATABASE IF NOT EXISTS medical_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medical_management;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('reception', 'nurse', 'doctor', 'laboratory', 'admin') NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    profession VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    id_number VARCHAR(50),
    id_mrz VARCHAR(50),
    id_passport_number VARCHAR(50),
    id_place_of_issue VARCHAR(100),
    id_photo VARCHAR(255),
    personal_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vitals Table
CREATE TABLE IF NOT EXISTS vitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    weight DECIMAL(5,2),
    height INT,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,2),
    pulse INT,
    bmi DECIMAL(4,2),
    respiration_rate INT,
    visual_tests JSON,
    systems_examination JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Visits Table
CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    visit_date DATE NOT NULL,
    complaint TEXT NOT NULL,
    diagnosis TEXT,
    summary TEXT,
    treatment_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Laboratory Tests Table
CREATE TABLE IF NOT EXISTS laboratory_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    test_value VARCHAR(50) NOT NULL,
    normal_range VARCHAR(50),
    unit VARCHAR(20),
    result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_test_name (test_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    before_value TEXT,
    after_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Laboratory Test Types Table (Reference table for test types)
CREATE TABLE IF NOT EXISTS laboratory_test_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_name VARCHAR(100) UNIQUE NOT NULL,
    normal_range VARCHAR(100),
    unit VARCHAR(20),
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Laboratory Test Types
INSERT INTO laboratory_test_types (test_name, normal_range, unit, category) VALUES
-- Blood Tests
('Hemoglobin (Hb)', 'Male: 13-17 g/dL / Female: 12-15 g/dL', 'g/dL', 'Blood'),
('WBC', '4,000 - 11,000', '/µL', 'Blood'),
('RBC', '4.5 - 5.9 million', 'million', 'Blood'),
('Platelets', '150,000 - 450,000', '/µL', 'Blood'),
('Hematocrit', '38-52%', '%', 'Blood'),

-- Sugar Tests
('Fasting Blood Sugar', '70-99 mg/dL', 'mg/dL', 'Sugar'),
('Random Blood Sugar', '< 140 mg/dL', 'mg/dL', 'Sugar'),
('HbA1c', '< 5.7%', '%', 'Sugar'),

-- Kidney Function Tests
('Creatinine', '0.6 - 1.3 mg/dL', 'mg/dL', 'Kidney'),
('Urea', '7 - 20 mg/dL', 'mg/dL', 'Kidney'),

-- Liver Function Tests
('ALT (SGPT)', '7 - 56 U/L', 'U/L', 'Liver'),
('AST (SGOT)', '10 - 40 U/L', 'U/L', 'Liver'),
('ALP', '44 - 147 IU/L', 'IU/L', 'Liver'),
('Bilirubin', '0.1 - 1.2 mg/dL', 'mg/dL', 'Liver'),

-- Lipid Tests
('Total Cholesterol', '< 200 mg/dL', 'mg/dL', 'Lipid'),
('LDL', '< 100 mg/dL', 'mg/dL', 'Lipid'),
('HDL', '> 40 mg/dL', 'mg/dL', 'Lipid'),
('Triglycerides', '< 150 mg/dL', 'mg/dL', 'Lipid'),

-- Urine Tests
('Urine Protein', 'Negative', '', 'Urine'),
('Urine Glucose', 'Negative', '', 'Urine'),
('Urine pH', '4.5 - 8', '', 'Urine'),
('Urine Specific Gravity', '1.005 - 1.030', '', 'Urine');

-- Insert Default Users
INSERT INTO users (username, password, role, full_name) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System Administrator'),
('reception', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reception', 'Reception Staff'),
('nurse', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'nurse', 'Nurse'),
('doctor', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'doctor', 'Doctor'),
('lab', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'laboratory', 'Laboratory Technician');

-- Note: Default password for all users is 'password'
-- Change passwords immediately in production!
