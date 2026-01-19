<?php
class Visit {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($patientId, $data, $userId = null) {
        // Check if user_id column exists
        $checkColumn = $this->db->query("SHOW COLUMNS FROM visits LIKE 'user_id'");
        $columnExists = $checkColumn->rowCount() > 0;
        
        if ($columnExists) {
            $stmt = $this->db->prepare("
                INSERT INTO visits (
                    patient_id, visit_date, complaint, diagnosis, 
                    summary, treatment_plan, user_id, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $patientId,
                $data['visit_date'],
                $data['complaint'],
                $data['diagnosis'] ?? null,
                $data['summary'] ?? null,
                $data['treatment_plan'] ?? null,
                $userId,
            ]);
        } else {
            // Fallback: Insert without user_id
            $stmt = $this->db->prepare("
                INSERT INTO visits (
                    patient_id, visit_date, complaint, diagnosis, 
                    summary, treatment_plan, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $patientId,
                $data['visit_date'],
                $data['complaint'],
                $data['diagnosis'] ?? null,
                $data['summary'] ?? null,
                $data['treatment_plan'] ?? null,
            ]);
        }
        
        return $this->db->lastInsertId();
    }

    public function findByPatientId($patientId) {
        // Try to use user_id from visits table, fallback to activity_logs if column doesn't exist
        try {
            // First, check if user_id column exists
            $checkColumn = $this->db->query("SHOW COLUMNS FROM visits LIKE 'user_id'");
            $columnExists = $checkColumn->rowCount() > 0;
            
            if ($columnExists) {
                // Use user_id from visits table
                $stmt = $this->db->prepare("
                    SELECT v.*, u.full_name as doctor_name, u.username as doctor_username
                    FROM visits v
                    LEFT JOIN users u ON v.user_id = u.id
                    WHERE v.patient_id = ? 
                    ORDER BY v.visit_date DESC, v.created_at DESC
                ");
            } else {
                // Fallback: Get user from activity_logs
                $stmt = $this->db->prepare("
                    SELECT v.*, 
                           u.full_name as doctor_name, 
                           u.username as doctor_username
                    FROM visits v
                    LEFT JOIN activity_logs al ON al.entity_type = 'visit' 
                        AND al.entity_id = v.id 
                        AND al.action = 'create'
                    LEFT JOIN users u ON al.user_id = u.id
                    WHERE v.patient_id = ? 
                    ORDER BY v.visit_date DESC, v.created_at DESC
                ");
            }
        } catch (Exception $e) {
            // If error, use fallback method with activity_logs
            $stmt = $this->db->prepare("
                SELECT v.*, 
                       u.full_name as doctor_name, 
                       u.username as doctor_username
                FROM visits v
                LEFT JOIN activity_logs al ON al.entity_type = 'visit' 
                    AND al.entity_id = v.id 
                    AND al.action = 'create'
                LEFT JOIN users u ON al.user_id = u.id
                WHERE v.patient_id = ? 
                ORDER BY v.visit_date DESC, v.created_at DESC
            ");
        }
        
        $stmt->execute([$patientId]);
        return $stmt->fetchAll();
    }
}
