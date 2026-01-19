<?php
class AuthController {
    private $authService;
    private $activityLog;

    public function __construct() {
        $this->authService = new AuthService();
        $this->activityLog = new ActivityLog();
    }

    public function login() {
        // Check trial lock before login
        $trialLock = new TrialLockService();
        $lockStatus = $trialLock->checkLock();
        
        if ($lockStatus['locked']) {
            http_response_code(403);
            echo json_encode([
                'error' => 'System locked',
                'message' => 'Trial period has expired. Please contact administrator.',
                'locked' => true,
                'daysRemaining' => 0
            ]);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and password are required']);
            return;
        }

        $result = $this->authService->login($data['username'], $data['password']);

        if ($result['success']) {
            // Log login activity
            $this->activityLog->create(
                $result['user']['id'],
                'login',
                'user',
                $result['user']['id'],
                'User logged in'
            );

            // Attempt to create backup if needed
            try {
                $backupService = new BackupService();
                if ($backupService->shouldBackup()) {
                    $backupService->createBackup($result['user']['id']);
                }
            } catch (Exception $e) {
                // Log error but don't fail login
                error_log("Backup check failed during login: " . $e->getMessage());
            }
            
            echo json_encode($result);
        } else {
            http_response_code(401);
            echo json_encode(['message' => $result['message']]);
        }
    }

    public function verify() {
        $user = AuthMiddleware::handle();
        echo json_encode(['user' => $user]);
    }
}
