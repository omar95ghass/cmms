<?php
// Test file to check API routing
// Access: http://localhost:8000/test-api.php

echo "API Test\n";
echo "REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'NOT SET') . "\n";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'NOT SET') . "\n";
echo "SCRIPT_NAME: " . ($_SERVER['SCRIPT_NAME'] ?? 'NOT SET') . "\n";

// Test autoloader
require_once __DIR__ . '/config/config.php';

if (class_exists('AuthController')) {
    echo "AuthController class found!\n";
} else {
    echo "AuthController class NOT found!\n";
}

if (class_exists('Database')) {
    echo "Database class found!\n";
} else {
    echo "Database class NOT found!\n";
}

// Test database connection
try {
    $db = Database::getInstance();
    echo "Database connection: OK\n";
} catch (Exception $e) {
    echo "Database connection: FAILED - " . $e->getMessage() . "\n";
}
