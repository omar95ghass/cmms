<?php
class LaboratoryTest {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($patientId, $data) {
        $stmt = $this->db->prepare("
            INSERT INTO laboratory_tests (
                patient_id, test_name, test_value, normal_range, 
                unit, result, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $patientId,
            $data['test_name'],
            $data['test_value'],
            $data['normal_range'] ?? null,
            $data['unit'] ?? null,
            $data['result'] ?? null,
        ]);
        
        return $this->db->lastInsertId();
    }

    public function findByPatientId($patientId) {
        $stmt = $this->db->prepare("
            SELECT * FROM laboratory_tests 
            WHERE patient_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$patientId]);
        return $stmt->fetchAll();
    }

    public function getTestTypes() {
        // First try to get from test_types table
        $stmt = $this->db->query("
            SELECT id, test_name, normal_range, unit, category
            FROM laboratory_test_types 
            ORDER BY category, test_name
        ");
        $results = $stmt->fetchAll();
        
        // If no results, fallback to distinct from tests table
        if (empty($results)) {
            $stmt = $this->db->query("
                SELECT DISTINCT test_name, normal_range, unit 
                FROM laboratory_tests 
                WHERE test_name IS NOT NULL AND patient_id > 0
                ORDER BY test_name
            ");
            $results = $stmt->fetchAll();
        }
        
        return $results;
    }
}
