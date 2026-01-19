<?php
class AuthService {
    private $userModel;

    public function __construct() {
        $this->userModel = new User();
    }

    public function login($username, $password) {
        $user = $this->userModel->findByUsername($username);
        
        if (!$user || !$this->userModel->verifyPassword($password, $user['password'])) {
            return ['success' => false, 'message' => 'Invalid credentials'];
        }

        // Generate token (simple implementation - use JWT in production)
        $token = $this->generateToken($user['id']);
        
        // Remove password from response
        unset($user['password']);
        
        return [
            'success' => true,
            'token' => $token,
            'user' => $user,
        ];
    }

    public function verifyToken($token) {
        // Simple token verification (use JWT in production)
        $userId = $this->validateToken($token);
        if ($userId) {
            $user = $this->userModel->findById($userId);
            if ($user && isset($user['password'])) {
                unset($user['password']);
            }
            return $user;
        }
        return null;
    }

    private function generateToken($userId) {
        $payload = [
            'user_id' => $userId,
            'exp' => time() + (24 * 60 * 60), // 24 hours
        ];
        return base64_encode(json_encode($payload));
    }

    private function validateToken($token) {
        try {
            $payload = json_decode(base64_decode($token), true);
            if ($payload && isset($payload['user_id']) && $payload['exp'] > time()) {
                return $payload['user_id'];
            }
        } catch (Exception $e) {
            return null;
        }
        return null;
    }
}
