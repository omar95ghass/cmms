<?php
class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByUsername($username) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public function findAll() {
        $stmt = $this->db->query("
            SELECT id, username, role, full_name, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll();
    }

    public function create($data) {
        $username = trim($data['username']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $role = trim($data['role']);
        $fullName = !empty($data['full_name']) ? trim($data['full_name']) : null;

        $stmt = $this->db->prepare("
            INSERT INTO users (username, password, role, full_name, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");

        $stmt->execute([$username, $password, $role, $fullName]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $username = trim($data['username']);
        $role = trim($data['role']);
        $fullName = !empty($data['full_name']) ? trim($data['full_name']) : null;

        $updatePassword = !empty($data['password']);
        
        if ($updatePassword) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("
                UPDATE users SET
                    username = ?, password = ?, role = ?, full_name = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$username, $password, $role, $fullName, $id]);
        } else {
            $stmt = $this->db->prepare("
                UPDATE users SET
                    username = ?, role = ?, full_name = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$username, $role, $fullName, $id]);
        }

        return $stmt->rowCount() > 0;
    }

    public function delete($id) {
        // Check if this is the last admin
        $adminCount = $this->db->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")->fetch();
        $user = $this->findById($id);
        
        if ($user && $user['role'] === 'admin' && $adminCount['count'] <= 1) {
            throw new Exception('Cannot delete the last admin user');
        }

        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        return $stmt->rowCount() > 0;
    }
}
