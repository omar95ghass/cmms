<?php
class UserController {
    private $userModel;
    private $activityLog;
    private $user;

    public function __construct() {
        $this->userModel = new User();
        $this->activityLog = new ActivityLog();
        $this->user = AuthMiddleware::handle();
        
        // Only admin can access user management
        if ($this->user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            exit;
        }
    }

    public function index() {
        $users = $this->userModel->findAll();
        echo json_encode($users);
    }

    public function show($id) {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        // Remove password from response
        unset($user['password']);
        echo json_encode($user);
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validation
        $errors = [];
        if (empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } elseif ($this->userModel->findByUsername($data['username'])) {
            $errors['username'] = 'Username already exists';
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        if (empty($data['role'])) {
            $errors['role'] = 'Role is required';
        } elseif (!in_array($data['role'], ['reception', 'nurse', 'doctor', 'laboratory', 'admin'])) {
            $errors['role'] = 'Invalid role';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        try {
            $userId = $this->userModel->create($data);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'create',
                'user',
                $userId,
                "Created user: {$data['username']}",
                null,
                ['username' => $data['username'], 'role' => $data['role']]
            );

            http_response_code(201);
            echo json_encode(['id' => $userId, 'success' => true, 'message' => 'User created successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id) {
        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $beforeValue = ['username' => $user['username'], 'role' => $user['role'], 'full_name' => $user['full_name']];

        // Validation
        $errors = [];
        if (empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } elseif ($data['username'] !== $user['username'] && $this->userModel->findByUsername($data['username'])) {
            $errors['username'] = 'Username already exists';
        }

        if (!empty($data['password']) && strlen($data['password']) < 6) {
            $errors['password'] = 'Password must be at least 6 characters';
        }

        if (empty($data['role'])) {
            $errors['role'] = 'Role is required';
        } elseif (!in_array($data['role'], ['reception', 'nurse', 'doctor', 'laboratory', 'admin'])) {
            $errors['role'] = 'Invalid role';
        }

        if (!empty($errors)) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        try {
            $this->userModel->update($id, $data);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'update',
                'user',
                $id,
                "Updated user: {$data['username']}",
                $beforeValue,
                $data
            );

            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id) {
        // Prevent self-deletion
        if ($id == $this->user['id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete your own account']);
            return;
        }

        $user = $this->userModel->findById($id);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }

        try {
            $this->userModel->delete($id);

            // Log activity
            $this->activityLog->create(
                $this->user['id'],
                'delete',
                'user',
                $id,
                "Deleted user: {$user['username']}",
                ['username' => $user['username'], 'role' => $user['role']],
                null
            );

            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
