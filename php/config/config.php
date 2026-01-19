<?php
define('BASE_PATH', dirname(__DIR__));
define('API_PATH', BASE_PATH . '/api');

// Start output buffering to ensure headers are sent properly
ob_start();

// CORS Headers
header('Access-Control-Allow-Origin: https://cmms-6bkk.onrender.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Only set Content-Type to JSON if it's not a file upload
if (empty($_FILES) && strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') === false) {
    header('Content-Type: application/json; charset=utf-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit();
}

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Riyadh');

// Autoloader
spl_autoload_register(function ($class) {
    $paths = [
        BASE_PATH . '/models/',
        BASE_PATH . '/controllers/',
        BASE_PATH . '/services/',
        BASE_PATH . '/middleware/',
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    // Log if class not found (for debugging)
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        error_log("Class not found: {$class} in paths: " . implode(', ', $paths));
    }
    
    return false;
});

require_once BASE_PATH . '/config/database.php';
