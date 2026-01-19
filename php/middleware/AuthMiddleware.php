<?php
class AuthMiddleware {
    public static function handle() {
        // Check trial lock before authentication
        $trialLock = new TrialLockService();
        if ($trialLock->isLocked()) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'error' => 'System locked',
                'message' => 'Trial period has expired. Please contact administrator.',
                'locked' => true
            ]);
            if (ob_get_level()) {
                ob_end_flush();
            }
            exit;
        }

        $token = null;

        // Try to get Authorization header (works with both Apache and PHP Built-in Server)
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
            } elseif (isset($headers['authorization'])) {
                $authHeader = $headers['authorization'];
            }
        } else {
            // Fallback for PHP Built-in Server
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            }
        }

        // Extract token from Bearer header
        if (isset($authHeader) && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized']);
            if (ob_get_level()) {
                ob_end_flush();
            }
            exit;
        }

        $authService = new AuthService();
        $user = $authService->verifyToken($token);

        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid token']);
            if (ob_get_level()) {
                ob_end_flush();
            }
            exit;
        }

        // Remove password from user data
        if (isset($user['password'])) {
            unset($user['password']);
        }

        return $user;
    }
}
