<?php
// Simple test endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'success',
    'message' => 'API test endpoint is working',
    'time' => date('Y-m-d H:i:s')
]);
exit;
