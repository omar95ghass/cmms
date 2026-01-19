-- Insert Default Laboratory Test Types with Normal Ranges
-- This file contains common laboratory tests with their normal ranges

USE medical_management;

-- Blood Tests
INSERT INTO laboratory_tests (patient_id, test_name, test_value, normal_range, unit, result, created_at) VALUES
(0, 'Hemoglobin (Hb)', '0', 'Male: 13-17 g/dL / Female: 12-15 g/dL', 'g/dL', 'Reference values', NOW()),
(0, 'WBC', '0', '4,000 - 11,000', '/µL', 'Reference values', NOW()),
(0, 'RBC', '0', '4.5 - 5.9 million', 'million', 'Reference values', NOW()),
(0, 'Platelets', '0', '150,000 - 450,000', '/µL', 'Reference values', NOW()),
(0, 'Hematocrit', '0', '38-52%', '%', 'Reference values', NOW()),

-- Sugar Tests
(0, 'Fasting Blood Sugar', '0', '70-99 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'Random Blood Sugar', '0', '< 140 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'HbA1c', '0', '< 5.7%', '%', 'Reference values', NOW()),

-- Kidney Function Tests
(0, 'Creatinine', '0', '0.6 - 1.3 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'Urea', '0', '7 - 20 mg/dL', 'mg/dL', 'Reference values', NOW()),

-- Liver Function Tests
(0, 'ALT (SGPT)', '0', '7 - 56 U/L', 'U/L', 'Reference values', NOW()),
(0, 'AST (SGOT)', '0', '10 - 40 U/L', 'U/L', 'Reference values', NOW()),
(0, 'ALP', '0', '44 - 147 IU/L', 'IU/L', 'Reference values', NOW()),
(0, 'Bilirubin', '0', '0.1 - 1.2 mg/dL', 'mg/dL', 'Reference values', NOW()),

-- Lipid Tests
(0, 'Total Cholesterol', '0', '< 200 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'LDL', '0', '< 100 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'HDL', '0', '> 40 mg/dL', 'mg/dL', 'Reference values', NOW()),
(0, 'Triglycerides', '0', '< 150 mg/dL', 'mg/dL', 'Reference values', NOW()),

-- Urine Tests
(0, 'Urine Protein', '0', 'Negative', '', 'Reference values', NOW()),
(0, 'Urine Glucose', '0', 'Negative', '', 'Reference values', NOW()),
(0, 'Urine pH', '0', '4.5 - 8', '', 'Reference values', NOW()),
(0, 'Urine Specific Gravity', '0', '1.005 - 1.030', '', 'Reference values', NOW());

-- Note: These are reference entries with patient_id = 0
-- They will be used to populate the test types dropdown
-- Actual patient test results will have real patient_id values
