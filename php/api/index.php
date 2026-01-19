<?php
// Start output buffering
if (!ob_get_level()) {
    ob_start();
}

require_once __DIR__ . '/../config/config.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$requestUri = strtok($requestUri, '?');

// Remove base path /api
$basePath = '/api';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Ensure we have at least a leading slash
if (empty($requestUri)) {
    $requestUri = '/';
}

// Remove leading/trailing slashes
$requestUri = trim($requestUri, '/');
$segments = $requestUri ? explode('/', $requestUri) : [];

// Route handling
try {
    // Handle empty route
    if (empty($segments) || (count($segments) === 1 && $segments[0] === '')) {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found', 'debug' => ['uri' => $_SERVER['REQUEST_URI'], 'segments' => $segments]]);
        exit;
    }

    // Route: /auth/login (handle first, before general controller loading)
    if ($segments[0] === 'auth' && isset($segments[1])) {
        $authController = new AuthController();
        if ($segments[1] === 'login' && $requestMethod === 'POST') {
            $authController->login();
        } elseif ($segments[1] === 'verify' && $requestMethod === 'GET') {
            $authController->verify();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        exit;
    }

    // Route: /system-settings (handle before general controller loading)
    if ($segments[0] === 'system-settings') {
        // Load the controller file manually to ensure it's available
        $controllerFile = BASE_PATH . '/controllers/SystemSettingsController.php';
        if (file_exists($controllerFile)) {
            require_once $controllerFile;
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'System settings controller file not found']);
            exit;
        }
        
        if ($requestMethod === 'GET' && count($segments) === 1) {
            // Public endpoint - anyone can read settings (no auth required)
            $settingsController = new SystemSettingsPublicController();
            $settingsController->get();
        } elseif ($requestMethod === 'PUT' && count($segments) === 1) {
            // Admin-only endpoint for updating (requires auth)
            $settingsController = new SystemSettingsController();
            $settingsController->update();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        exit;
    }

    // Convert endpoint to controller name
    // Handle plural to singular conversion (e.g., patients -> Patient)
    $endpoint = $segments[0];
    $controllerName = ucfirst($endpoint) . 'Controller';
    
    // Map plural endpoints to singular controllers
    $pluralToSingular = [
        'patients' => 'Patient',
        'activity-logs' => 'ActivityLog',
        'users' => 'User',
        'laboratory-test-types' => 'LaboratoryTestType',
    ];
    
    if (isset($pluralToSingular[$endpoint])) {
        $controllerName = $pluralToSingular[$endpoint] . 'Controller';
    }
    
    // Try to load the controller class
    $controllerFile = BASE_PATH . '/controllers/' . $controllerName . '.php';
    
    // Check if controller file exists
    if (!file_exists($controllerFile)) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Controller not found',
            'debug' => [
                'controller' => $controllerName,
                'file' => $controllerFile,
                'segments' => $segments,
                'request_uri' => $_SERVER['REQUEST_URI']
            ]
        ]);
        exit;
    }
    
    // Load controller file manually if autoloader didn't work
    if (!class_exists($controllerName)) {
        require_once $controllerFile;
    }
    
    // Check again if class exists after manual load
    if (!class_exists($controllerName)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to load controller',
            'debug' => [
                'controller' => $controllerName,
                'file' => $controllerFile
            ]
        ]);
        exit;
    }

    $controller = new $controllerName();

    // Route: /dashboard/stats
    if ($segments[0] === 'dashboard' && isset($segments[1]) && $segments[1] === 'stats') {
        if ($requestMethod === 'GET') {
            $controller->stats();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        exit;
    }

    // Route: /patients
    if ($segments[0] === 'patients') {
        if ($requestMethod === 'GET' && count($segments) === 1) {
            $controller->index();
        } elseif ($requestMethod === 'POST' && count($segments) === 1) {
            $controller->create();
        } elseif ($requestMethod === 'GET' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $controller->show($segments[1]);
        } elseif ($requestMethod === 'PUT' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $controller->update($segments[1]);
        } elseif (isset($segments[2])) {
            // Nested routes: /patients/:id/vitals, /patients/:id/visits, /patients/:id/laboratory
            $patientId = $segments[1];
            $action = $segments[2];
            
            if ($action === 'vitals') {
                if ($requestMethod === 'POST') {
                    $vitalController = new VitalController();
                    $vitalController->create($patientId);
                } elseif ($requestMethod === 'GET') {
                    $controller->getVitals($patientId);
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
            } elseif ($action === 'visits') {
                if ($requestMethod === 'POST') {
                    $visitController = new VisitController();
                    $visitController->create($patientId);
                } elseif ($requestMethod === 'GET') {
                    $controller->getVisits($patientId);
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
            } elseif ($action === 'laboratory') {
                if ($requestMethod === 'POST') {
                    $labController = new LaboratoryController();
                    $labController->create($patientId);
                } elseif ($requestMethod === 'GET') {
                    $controller->getLaboratory($patientId);
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
            } elseif ($action === 'documents') {
                if ($requestMethod === 'POST') {
                    // Upload document: POST /patients/:id/documents
                    $controller->uploadDocument($patientId);
                } elseif ($requestMethod === 'DELETE' && isset($segments[3]) && count($segments) === 4) {
                    // Delete document: DELETE /patients/:id/documents/:type
                    $documentType = $segments[3];
                    $controller->deleteDocument($patientId, $documentType);
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        exit;
    }

    // Route: /laboratory/test-types
    if ($segments[0] === 'laboratory' && isset($segments[1]) && $segments[1] === 'test-types') {
        if ($requestMethod === 'GET') {
            $labController = new LaboratoryController();
            $labController->getTestTypes();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        exit;
    }

    // Route: /activity-logs
    if ($segments[0] === 'activity-logs') {
        if ($requestMethod === 'GET') {
            if (isset($segments[1]) && $segments[1] === 'filters') {
                $controller->getFilters();
            } else {
                $controller->index();
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
        exit;
    }

    // Route: /users (CRUD operations)
    if ($segments[0] === 'users') {
        $userController = new UserController();
        if ($requestMethod === 'GET' && count($segments) === 1) {
            $userController->index();
        } elseif ($requestMethod === 'POST' && count($segments) === 1) {
            $userController->create();
        } elseif ($requestMethod === 'GET' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $userController->show($segments[1]);
        } elseif ($requestMethod === 'PUT' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $userController->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $userController->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        exit;
    }

    // Route: /laboratory-test-types (CRUD operations)
    if ($segments[0] === 'laboratory-test-types') {
        $testTypeController = new LaboratoryTestTypeController();
        if ($requestMethod === 'GET' && count($segments) === 1) {
            $testTypeController->index();
        } elseif ($requestMethod === 'POST' && count($segments) === 1) {
            $testTypeController->create();
        } elseif ($requestMethod === 'GET' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $testTypeController->show($segments[1]);
        } elseif ($requestMethod === 'PUT' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $testTypeController->update($segments[1]);
        } elseif ($requestMethod === 'DELETE' && isset($segments[1]) && is_numeric($segments[1]) && count($segments) === 2) {
            $testTypeController->delete($segments[1]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
        }
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Error $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Fatal error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
