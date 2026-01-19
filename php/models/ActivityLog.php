<?php
class ActivityLog {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($userId, $action, $entityType, $entityId, $details = null, $beforeValue = null, $afterValue = null) {
        $stmt = $this->db->prepare("
            INSERT INTO activity_logs (
                user_id, action, entity_type, entity_id, 
                details, before_value, after_value, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $userId,
            $action,
            $entityType,
            $entityId,
            $details ? json_encode($details) : null,
            $beforeValue ? json_encode($beforeValue) : null,
            $afterValue ? json_encode($afterValue) : null,
        ]);
        
        return $this->db->lastInsertId();
    }

    public function findAll($filters = [], $limit = 100) {
        $conditions = [];
        $params = [];
        
        // Filter by username
        if (!empty($filters['username'])) {
            $conditions[] = "u.username LIKE ?";
            $params[] = '%' . $filters['username'] . '%';
        }
        
        // Filter by action
        if (!empty($filters['action'])) {
            $conditions[] = "al.action = ?";
            $params[] = $filters['action'];
        }
        
        // Filter by date (from)
        if (!empty($filters['date_from'])) {
            $conditions[] = "DATE(al.created_at) >= ?";
            $params[] = $filters['date_from'];
        }
        
        // Filter by date (to)
        if (!empty($filters['date_to'])) {
            $conditions[] = "DATE(al.created_at) <= ?";
            $params[] = $filters['date_to'];
        }
        
        // Build WHERE clause
        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';
        
        $stmt = $this->db->prepare("
            SELECT al.*, u.username, u.role
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            {$whereClause}
            ORDER BY al.created_at DESC
            LIMIT ?
        ");
        
        $params[] = $limit;
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function getUniqueActions() {
        $stmt = $this->db->query("
            SELECT DISTINCT action 
            FROM activity_logs 
            ORDER BY action
        ");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    public function getUniqueUsernames() {
        $stmt = $this->db->query("
            SELECT DISTINCT u.username 
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE u.username IS NOT NULL
            ORDER BY u.username
        ");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    public function findByEntity($entityType, $entityId) {
        $stmt = $this->db->prepare("
            SELECT al.*, u.username, u.role
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.entity_type = ? AND al.entity_id = ?
            ORDER BY al.created_at DESC
        ");
        $stmt->execute([$entityType, $entityId]);
        return $stmt->fetchAll();
    }
}
