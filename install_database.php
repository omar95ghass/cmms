<?php
/**
 * Database Installation Script
 * Run this file once to create the database and all tables
 * Usage: php install_database.php
 */

// Database configuration
$config = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'dbname' => 'medical_management',
    'charset' => 'utf8mb4',
];

echo "=== Medical Management System - Database Installation ===\n\n";

try {
    // Connect to MySQL server (without database)
    $dsn = "mysql:host={$config['host']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    
    echo "✓ Connected to MySQL server\n";
    
    // Create database if not exists
    echo "Creating database '{$config['dbname']}'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['dbname']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database created/verified\n\n";
    
    // Select database
    $pdo->exec("USE `{$config['dbname']}`");
    echo "✓ Using database '{$config['dbname']}'\n\n";
    
    // Read and execute schema file
    $schemaFile = __DIR__ . '/php/database/schema.sql';
    
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found: {$schemaFile}");
    }
    
    echo "Reading schema file...\n";
    $schema = file_get_contents($schemaFile);
    
    // Remove comments and split by semicolon
    // Remove SQL comments (-- and /* */)
    $schema = preg_replace('/--.*$/m', '', $schema);
    $schema = preg_replace('/\/\*.*?\*\//s', '', $schema);
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $schema)));
    
    echo "Creating tables...\n";
    $tableCount = 0;
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        
        // Skip empty statements
        if (empty($statement)) {
            continue;
        }
        
        // Skip USE and CREATE DATABASE statements (already handled)
        if (preg_match('/^(USE|CREATE DATABASE)/i', $statement)) {
            continue;
        }
        
        try {
            $pdo->exec($statement);
            
            // Count CREATE TABLE statements
            if (preg_match('/^CREATE TABLE/i', $statement)) {
                if (preg_match('/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/i', $statement, $matches)) {
                    $tableName = $matches[1];
                    echo "  ✓ Table '{$tableName}' created\n";
                    $tableCount++;
                }
            }
        } catch (PDOException $e) {
            // Ignore "table already exists" errors if using IF NOT EXISTS
            if (strpos($e->getMessage(), 'already exists') === false) {
                echo "  ⚠ Warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✓ Database installation completed!\n";
    echo "✓ Total tables created: {$tableCount}\n\n";
    
    // Insert default laboratory test types
    echo "Inserting default laboratory test types...\n";
    $testTypes = [
        ['Hemoglobin (Hb)', 'Male: 13-17 g/dL / Female: 12-15 g/dL', 'g/dL', 'Blood'],
        ['WBC', '4,000 - 11,000', '/µL', 'Blood'],
        ['RBC', '4.5 - 5.9 million', 'million', 'Blood'],
        ['Platelets', '150,000 - 450,000', '/µL', 'Blood'],
        ['Hematocrit', '38-52%', '%', 'Blood'],
        ['Fasting Blood Sugar', '70-99 mg/dL', 'mg/dL', 'Sugar'],
        ['Random Blood Sugar', '< 140 mg/dL', 'mg/dL', 'Sugar'],
        ['HbA1c', '< 5.7%', '%', 'Sugar'],
        ['Creatinine', '0.6 - 1.3 mg/dL', 'mg/dL', 'Kidney'],
        ['Urea', '7 - 20 mg/dL', 'mg/dL', 'Kidney'],
        ['ALT (SGPT)', '7 - 56 U/L', 'U/L', 'Liver'],
        ['AST (SGOT)', '10 - 40 U/L', 'U/L', 'Liver'],
        ['ALP', '44 - 147 IU/L', 'IU/L', 'Liver'],
        ['Bilirubin', '0.1 - 1.2 mg/dL', 'mg/dL', 'Liver'],
        ['Total Cholesterol', '< 200 mg/dL', 'mg/dL', 'Lipid'],
        ['LDL', '< 100 mg/dL', 'mg/dL', 'Lipid'],
        ['HDL', '> 40 mg/dL', 'mg/dL', 'Lipid'],
        ['Triglycerides', '< 150 mg/dL', 'mg/dL', 'Lipid'],
        ['Urine Protein', 'Negative', '', 'Urine'],
        ['Urine Glucose', 'Negative', '', 'Urine'],
        ['Urine pH', '4.5 - 8', '', 'Urine'],
        ['Urine Specific Gravity', '1.005 - 1.030', '', 'Urine'],
    ];
    
    $insertTestTypes = $pdo->prepare("INSERT IGNORE INTO laboratory_test_types (test_name, normal_range, unit, category) VALUES (?, ?, ?, ?)");
    $insertedCount = 0;
    
    foreach ($testTypes as $test) {
        try {
            $insertTestTypes->execute($test);
            if ($insertTestTypes->rowCount() > 0) {
                $insertedCount++;
            }
        } catch (PDOException $e) {
            // Ignore duplicate entry errors
            if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                echo "  ⚠ Warning inserting test type '{$test[0]}': " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "  ✓ Inserted {$insertedCount} laboratory test types\n\n";
    
    // Verify tables
    echo "Verifying installation...\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables in database:\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `{$table}`");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "  - {$table} ({$count} rows)\n";
    }
    
    echo "\n=== Installation Successfully Completed ===\n";
    echo "\nDefault users (password: 'password'):\n";
    echo "  - admin (admin)\n";
    echo "  - reception (reception)\n";
    echo "  - nurse (nurse)\n";
    echo "  - doctor (doctor)\n";
    echo "  - laboratory (laboratory)\n";
    
} catch (PDOException $e) {
    echo "\n✗ Database Error: " . $e->getMessage() . "\n";
    echo "\nPlease check your database configuration in install_database.php\n";
    exit(1);
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
