<?php
// Router script for PHP Built-in Server
// Usage: php -S localhost:8000 router.php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors, but log them
ini_set('log_errors', 1);

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove query string
$requestPath = strtok($requestPath, '?');

// Serve uploaded files from /uploads directory
if (strpos($requestPath, '/uploads/') === 0) {
    $filePath = __DIR__ . $requestPath;
    if (file_exists($filePath) && is_file($filePath)) {
        // Set appropriate headers based on file type
        $mimeType = mime_content_type($filePath);
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));
        readfile($filePath);
        return true;
    }
}

// If the request is for a file that exists (and it's not an API request or uploads), serve it
if ($requestPath !== '/' && $requestPath !== '/api' && strpos($requestPath, '/api') !== 0 && strpos($requestPath, '/uploads/') !== 0) {
    $filePath = __DIR__ . $requestPath;
    if (file_exists($filePath) && is_file($filePath)) {
        return false; // Serve the file as-is
    }
}

// Route all API requests to api/index.php
// The front-end sends requests to /api/auth/login, so we keep /api prefix
if (strpos($requestPath, '/api') === 0) {
    // Keep the full path including /api for api/index.php to process
    $_SERVER['REQUEST_URI'] = $requestPath;
} else {
    // If no /api prefix, add it
    $_SERVER['REQUEST_URI'] = '/api' . ($requestPath === '/' ? '' : $requestPath);
}

// Set the script name
$_SERVER['SCRIPT_NAME'] = '/api/index.php';

// Try to include the API index with error handling
try {
    $apiIndexPath = __DIR__ . '/api/index.php';
    if (!file_exists($apiIndexPath)) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'API index file not found']);
        return true;
    }
    
    require $apiIndexPath;
    return true;
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    return true;
}
